import { match } from "ts-pattern";
import {
  Token,
  CharEnum,
  TokenEnum,
  specialChars,
  Char,
  SPECIAL_CHARS,
  SpecialChars,
  Instruction,
} from "./types";

const classifyChar = ({ char }: { char: string }): Char => {
  if (char in SPECIAL_CHARS) {
    const kind = SPECIAL_CHARS[char as keyof typeof SPECIAL_CHARS];
    return specialCharToCharType({ kind });
  }
  return { kind: CharEnum.REGULAR, char };
};

const specialCharToCharType = ({ kind }: { kind: SpecialChars }): Char => {
  return match(kind)
    .with(
      CharEnum.SINGLE_QUOTE,
      () => ({ kind: CharEnum.SINGLE_QUOTE } as Char)
    )
    .with(CharEnum.SPACE, () => ({ kind: CharEnum.SPACE } as Char))
    .with(
      CharEnum.DOUBLE_QUOTE,
      () => ({ kind: CharEnum.DOUBLE_QUOTE } as Char)
    )
    .with(CharEnum.BACKSLASH, () => ({ kind: CharEnum.BACKSLASH } as Char))
    .with(CharEnum.GT_SIGN, () => ({ kind: CharEnum.GT_SIGN } as Char))
    .exhaustive();
};
const ESCAPE_CHARACTER = "\\";
const ESCAPABLE_CHARACTERS = ['"', "\\"];

export const tokenize = ({ input }: { input: string }): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const charType = classifyChar({ char: input[i] });
    match(charType)
      .with({ kind: CharEnum.SINGLE_QUOTE }, () => {
        const start = ++i;
        while (i < input.length && input[i] !== "'") i++;
        tokens.push({ type: TokenEnum.QUOTED, value: input.slice(start, i) });
        i++;
      })
      .with({ kind: CharEnum.DOUBLE_QUOTE }, () => {
        let output = "";
        i++;
        while (i < input.length && input[i] !== '"') {
          if (
            input[i] === ESCAPE_CHARACTER &&
            ESCAPABLE_CHARACTERS.includes(input[i + 1])
          ) {
            output += input[i + 1];
            i += 2;
            continue;
          }
          output += input[i];
          i++;
        }
        tokens.push({ type: TokenEnum.QUOTED, value: output });
        i++;
      })
      .with({ kind: CharEnum.REGULAR }, () => {
        const start = i;
        while (i < input.length && !specialChars.includes(input[i])) i++;
        tokens.push({ type: TokenEnum.UNQUOTED, value: input.slice(start, i) });
      })
      .with({ kind: CharEnum.SPACE }, () => {
        i++;
      })
      .with({ kind: CharEnum.BACKSLASH }, () => {
        tokens.push({
          type: TokenEnum.ESCAPED,
          value: input.slice(i + 1, i + 2),
        });
        i += 2;
      })
      .with({ kind: CharEnum.GT_SIGN }, () => {
        tokens.push({ type: TokenEnum.OPERATOR, value: input[i] });
        i++;
      })
      .exhaustive();
  }

  return tokens;
};

const operators = {
  ">": () => {},
};

export const tokensToInstruction = ({
  tokens,
}: {
  tokens: Token[];
}): Instruction => {
  const output: Instruction = {
    command: tokens.shift().value,
    args: [],
    redirectTo: null,
  };
  let shouldBreak = false;

  for (let i = 0; i < tokens.length; i++) {
    if (shouldBreak) break;

    const token = tokens[i];

    match(token)
      .with(
        { type: TokenEnum.QUOTED },
        { type: TokenEnum.UNQUOTED },
        { type: TokenEnum.ESCAPED },
        (token) => {
          output.args.push(token.value);
        }
      )
      .with({ type: TokenEnum.WHITESPACE }, () => {})
      .with({ type: TokenEnum.OPERATOR }, () => {
        const isValidOperator = Object.keys(SPECIAL_CHARS).includes(
          token.value
        );

        if (!isValidOperator) throw new Error("Invalid operator detected");

        if (SPECIAL_CHARS[token.value] === CharEnum.GT_SIGN) {
          const redirectTo = tokens
            .slice(i + 1, tokens.length)
            .map((token) => token.value)
            .join(" ");
          output.redirectTo = redirectTo;
          shouldBreak = true;
        }
      })
      .exhaustive();
  }

  return output;
};
