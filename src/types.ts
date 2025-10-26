export type Token =
  | { type: TokenEnum.QUOTED; value: string }
  | { type: TokenEnum.UNQUOTED; value: string }
  | { type: TokenEnum.ESCAPED; value: string }
  | { type: TokenEnum.WHITESPACE; value: null };

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
}

export enum TokenEnum {
  QUOTED = "QUOTED",
  UNQUOTED = "UNQUOTED",
  WHITESPACE = "WHITESPACE",
  ESCAPED = "ESCAPED",
}

export const SPECIAL_CHARS = {
  "'": CharEnum.SINGLE_QUOTE,
  '"': CharEnum.DOUBLE_QUOTE,
  "\\": CharEnum.BACKSLASH,
  " ": CharEnum.SPACE,
} as const;

export const specialChars = Object.keys(SPECIAL_CHARS);

export type SpecialChars = (typeof SPECIAL_CHARS)[keyof typeof SPECIAL_CHARS];
