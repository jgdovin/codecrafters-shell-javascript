export type Token =
  | { type: TokenEnum.QUOTED; value: string }
  | { type: TokenEnum.UNQUOTED; value: string }
  | { type: TokenEnum.WHITESPACE; value: null };

export type Char =
  | { kind: CharEnum.SINGLE_QUOTE }
  | { kind: CharEnum.SPACE }
  | { kind: CharEnum.REGULAR; char: string };

export enum CharEnum {
  SINGLE_QUOTE = "SINGLE_QUOTE",
  SPACE = "SPACE",
  REGULAR = "REGULAR",
}

export enum TokenEnum {
  QUOTED = "QUOTED",
  UNQUOTED = "UNQUOTED",
  WHITESPACE = "WHITESPACE",
}
