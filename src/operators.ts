import { OperatorMethod, OPERATORS, Operators } from "./types";

const redirectOutput: OperatorMethod = ({
  output,
  tokens,
  cursor,
}): boolean => {
  output.redirectTo = tokens
    .slice(cursor + 1, tokens.length)
    .map((token) => token.value)
    .join(" ")
    .trim();
  return true;
};

export const operatorMethods: Record<Operators, OperatorMethod> = {
  ">": redirectOutput,
  "1>": redirectOutput,
};

export const matchOperator = ({
  input,
  cursor,
}: {
  input: string;
  cursor: number;
}) => {
  const sortedOps = [...OPERATORS].sort((a, b) => b.length - a.length);

  for (const op of sortedOps) {
    const slice = input.slice(cursor, cursor + op.length);
    if (slice === op) {
      return op;
    }
  }
  return null;
};
