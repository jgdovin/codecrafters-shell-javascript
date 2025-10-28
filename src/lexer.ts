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
import { matchOperator, operatorMethods } from "./operators";

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
    .exhaustive();
};
const ESCAPE_CHARACTER = "\\";
const ESCAPABLE_CHARACTERS = ['"', "\\"];

export const tokenize = ({ input }: { input: string }): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const operator = matchOperator({ input, cursor: i });

    if (operator) {
      tokens.push({ type: TokenEnum.OPERATOR, value: operator });
      i += operator.length;
      continue;
    }

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
        tokens.push({ type: TokenEnum.WHITESPACE, value: null });
        i++;
      })
      .with({ kind: CharEnum.BACKSLASH }, () => {
        tokens.push({
          type: TokenEnum.ESCAPED,
          value: input.slice(i + 1, i + 2),
        });
        i += 2;
      })
      .exhaustive();
  }

  return tokens;
};

let shouldBreak = false;

export const tokensToInstruction = ({
  tokens,
}: {
  tokens: Token[];
}): Instruction => {
  const command = tokens.shift();

  if (!command?.value) {
    throw new Error("We somehow do not have a command");
  }

  const output: Instruction = {
    command: command.value,
    args: [],
    redirectOutputTo: null,
    redirectErrorTo: null,
    appendOutputTo: null,
  };

  let currentArg = "";
  for (let i = 0; i < tokens.length; i++) {
    if (shouldBreak) {
      shouldBreak = false;
      break;
    }

    const token = tokens[i];

    match(token)
      .with(
        { type: TokenEnum.QUOTED },
        { type: TokenEnum.UNQUOTED },
        { type: TokenEnum.ESCAPED },
        (token) => {
          currentArg += token.value;
        }
      )
      .with({ type: TokenEnum.WHITESPACE }, () => {
        if (currentArg !== "") {
          output.args.push(currentArg);
          currentArg = "";
        }
      })
      .with({ type: TokenEnum.OPERATOR }, (token) => {
        if (currentArg !== "") {
          output.args.push(currentArg);
          currentArg = "";
        }
        if (!token.value) {
          throw new Error("No token found. Should be unreachable.");
        }

        if (token.value in operatorMethods) {
          i += operatorMethods[token.value]({
            output,
            tokens,
            cursor: i,
          });
        }
        return;
      })
      .exhaustive();
  }

  if (currentArg !== "") {
    output.args.push(currentArg);
  }
  return output;
};
