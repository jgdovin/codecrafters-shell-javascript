import { constants, accessSync } from "fs";
import { Char, CharEnum, Token, TokenEnum } from "./types";
import { match } from "ts-pattern";
export const hasPermission = (path, mode = constants.X_OK) => {
  try {
    accessSync(path, mode);
    return true;
  } catch {
    return false;
  }
};

export const checkPathForApp = ({
  command,
}: {
  command: string;
}): string | null => {
  const paths = process.env.PATH.split(":");
  for (const path of paths) {
    const filePath = `${path}/${command}`;
    if (hasPermission(filePath)) {
      return filePath;
    }
  }
  return null;
};

const classifyChar = ({ char }: { char: string }): Char => {
  return match(char)
    .with("'", () => ({ kind: CharEnum.SINGLE_QUOTE } as const))
    .with(" ", () => ({ kind: CharEnum.SPACE } as const))
    .otherwise((c) => ({ kind: CharEnum.REGULAR, char: c } as const));
};

const REGULAR_SPLIT_CHARS = [" ", "'", '"'];

export const tokenize = ({ input }: { input: string }): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const charType = classifyChar({ char: input[i] });
    match(charType)
      .with({ kind: CharEnum.SINGLE_QUOTE }, () => {
        const start = ++i; // ignore opening quote
        while (i < input.length && input[i] !== "'") i++;
        tokens.push({ type: TokenEnum.QUOTED, value: input.slice(start, i) });
        i++; // ignore closing quote
      })
      .with({ kind: CharEnum.REGULAR }, () => {
        const start = i;
        while (i < input.length && !REGULAR_SPLIT_CHARS.includes(input[i])) i++;
        tokens.push({ type: TokenEnum.UNQUOTED, value: input.slice(start, i) });
      })
      .with({ kind: CharEnum.SPACE }, () => {
        tokens.push({ type: TokenEnum.WHITESPACE, value: null });
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
      .with({ type: TokenEnum.QUOTED }, { type: TokenEnum.UNQUOTED }, (t) => {
        currentArg += t.value;
      })
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
