export type Token =
  | { type: TokenEnum.QUOTED; value: string }
  | { type: TokenEnum.UNQUOTED; value: string }
  | { type: TokenEnum.ESCAPED; value: string }
  | { type: TokenEnum.WHITESPACE; value: null }
  | { type: TokenEnum.OPERATOR; value: Operators };

export type Char =
  | { kind: CharEnum.SINGLE_QUOTE }
  | { kind: CharEnum.DOUBLE_QUOTE }
  | { kind: CharEnum.BACKSLASH }
  | { kind: CharEnum.SPACE }
  | { kind: CharEnum.REGULAR; char: string };

export enum CharEnum {
  BACKSLASH = "BACKSLASH",
  SINGLE_QUOTE = "SINGLE_QUOTE",
  DOUBLE_QUOTE = "DOUBLE_QUOTE",
  SPACE = "SPACE",
  REGULAR = "REGULAR",
  GT_SIGN = "GT_SIGN",
}

export enum TokenEnum {
  QUOTED = "QUOTED",
  UNQUOTED = "UNQUOTED",
  WHITESPACE = "WHITESPACE",
  ESCAPED = "ESCAPED",
  OPERATOR = "OPERATOR",
}

export const SPECIAL_CHARS = {
  "'": CharEnum.SINGLE_QUOTE,
  '"': CharEnum.DOUBLE_QUOTE,
  "\\": CharEnum.BACKSLASH,
  " ": CharEnum.SPACE,
} as const;

export const specialChars = Object.keys(SPECIAL_CHARS);

export type SpecialChars = (typeof SPECIAL_CHARS)[keyof typeof SPECIAL_CHARS];

export const OPERATORS = ["1>", ">", "2>", ">>", "1>>"] as const;

export type Operators = (typeof OPERATORS)[number];
export interface Instruction {
  command: string;
  args: string[];
  redirectOutputTo: string | null;
  redirectErrorTo: string | null;
  appendOutputTo: string | null;
}

export interface BuiltInMethodArgs {
  instruction: Instruction;
}

export type BuiltInMethod = ({
  instruction,
}: BuiltInMethodArgs) => string | void;

export type OperatorMethod = ({
  output,
  tokens,
  cursor,
}: {
  output: Instruction;
  tokens: Token[];
  cursor: number;
}) => number;
