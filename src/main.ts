import { createInterface } from "readline";
import { checkPathForApp } from "./utils";
import { spawnSync } from "child_process";
import { builtInCommands, builtInMethods } from "./built-ins";
import { tokensToInstruction, tokenize } from "./lexer";
import { CharEnum, SPECIAL_CHARS, Token, TokenEnum } from "./types";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const executeCommand = ({ tokens }: { tokens: Token[] }) => {
  const instruction = tokensToInstruction({ tokens });
  const { command } = instruction;

  const filePath = checkPathForApp({ command });

  if (!filePath) throw new Error("command not found");

  spawnSync(`${command}`, instruction.args, {
    encoding: "utf-8",
    stdio: "inherit",
  });
};

const parsePrompt = async (answer: string) => {
  const tokens = tokenize({ input: answer });
  const instruction = tokensToInstruction({ tokens });

  if (builtInCommands.includes(instruction.command)) {
    builtInMethods[instruction.command]({ args: instruction.args });
    return;
  }

  try {
    executeCommand({ tokens });
  } catch (e) {
    console.log(`${answer}: ${e.message}`);
  }
  return;
};

const promptUserInput = () => {
  rl.question("$ ", async (answer) => {
    await parsePrompt(answer);
    promptUserInput();
  });
};

promptUserInput();
