import { createInterface } from "readline";
import { checkPathForApp } from "./utils";
import { spawnSync } from "child_process";
import { builtInCommands, builtInMethods } from "./built-ins";
import { tokensToInstruction, tokenize } from "./lexer";
import { Instruction } from "./types";
import { openSync, writeFileSync } from "fs";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const executeCommand = ({ instruction }: { instruction: Instruction }) => {
  const { command } = instruction;

  const filePath = checkPathForApp({ command });

  if (!filePath) throw new Error("command not found");
  const stdOutTarget = instruction.redirectTo
    ? openSync(instruction.redirectTo, "w")
    : "inherit";
  spawnSync(`${command}`, instruction.args, {
    encoding: "utf-8",
    stdio: ["inherit", stdOutTarget, "inherit"],
  });
};

const parsePrompt = async (answer: string) => {
  const tokens = tokenize({ input: answer });

  const instruction = tokensToInstruction({ tokens });

  if (builtInCommands.includes(instruction.command)) {
    const output = builtInMethods[instruction.command]({
      instruction,
    });

    if (instruction.redirectTo) {
      writeFileSync(instruction.redirectTo, `${output}\n`);
      return;
    }
    if (output) {
      console.log(output);
    }
    return;
  }

  try {
    executeCommand({ instruction });
  } catch (e) {
    if (e instanceof Error) {
      console.log(`${answer}: ${e.message}`);
    } else {
      console.log(`${answer}: An unknown error occured`);
    }
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
