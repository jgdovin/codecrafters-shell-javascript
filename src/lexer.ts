import { match } from "ts-pattern";
import {
  Token,
  CharEnum,
  TokenEnum,
  specialChars,
  Char,
  SPECIAL_CHARS,
  SpecialChars,
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
    .exhaustive();
};

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
        const start = ++i;
        while (i < input.length && input[i] !== '"') i++;
        tokens.push({ type: TokenEnum.QUOTED, value: input.slice(start, i) });
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
        const start = ++i;
        tokens.push({
          type: TokenEnum.ESCAPED,
          value: input.slice(start, start + 1),
        });
        i++;
      })
      .exhaustive();
  }
  return tokens;
};

export const tokensToArgs = ({ tokens }: { tokens: Token[] }): string[] => {
  const args: string[] = [];
  let currentArg = "";

  for (const token of tokens) {
    match(token)
      .with(
        { type: TokenEnum.QUOTED },
        { type: TokenEnum.UNQUOTED },
        { type: TokenEnum.ESCAPED },
        (t) => {
          currentArg += t.value;
        }
      )
      .with({ type: TokenEnum.WHITESPACE }, () => {
        if (currentArg !== "") {
          args.push(currentArg);
          currentArg = "";
        }
      })
      .exhaustive();
  }
  if (currentArg !== "") args.push(currentArg);

  return args;
};
