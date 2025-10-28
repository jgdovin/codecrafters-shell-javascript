import { OperatorMethod, OPERATORS, Operators } from "./types";

const redirectOutput: OperatorMethod = ({ output, tokens, cursor }) => {
  output.redirectOutputTo = tokens
    .slice(cursor + 1, tokens.length)
    .map((token) => token.value)
    .join(" ")
    .trim();
  return tokens.length;
};

const appendOutput: OperatorMethod = ({ output, tokens, cursor }) => {
  output.appendOutputTo = tokens
    .slice(cursor + 1, tokens.length)
    .map((token) => token.value)
    .join(" ")
    .trim();
  return tokens.length;
};

const redirectError: OperatorMethod = ({ output, tokens, cursor }) => {
  output.redirectErrorTo = tokens
    .slice(cursor + 1, tokens.length)
    .map((token) => token.value)
    .join(" ")
    .trim();
  return tokens.length;
};

export const operatorMethods: Record<Operators, OperatorMethod> = {
  ">": redirectOutput,
  "1>": redirectOutput,
  "2>": redirectError,
  "1>>": appendOutput,
  ">>": appendOutput,
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
