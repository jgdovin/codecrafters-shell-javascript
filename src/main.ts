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

  if (!filePath) throw new Error(`${command}: command not found`);
  const stdOutTarget = instruction.redirectOutputTo
    ? openSync(instruction.redirectOutputTo, "w")
    : "inherit";

  const errorOutTarget = instruction.redirectErrorTo
    ? openSync(instruction.redirectErrorTo, "w")
    : "inherit";

  spawnSync(`${command}`, instruction.args, {
    encoding: "utf-8",
    stdio: ["inherit", stdOutTarget, errorOutTarget],
  });
};

const parsePrompt = async (answer: string) => {
  const tokens = tokenize({ input: answer });

  const instruction = tokensToInstruction({ tokens });

  try {
    if (instruction.redirectErrorTo) {
      // always create the error log file even if no error
      writeFileSync(instruction.redirectErrorTo, "");
    }

    if (builtInCommands.includes(instruction.command)) {
      const output = builtInMethods[instruction.command]({
        instruction,
      });

      if (instruction.redirectOutputTo) {
        writeFileSync(instruction.redirectOutputTo, `${output}\n`);
        return;
      }
      if (output) {
        console.log(output);
      }
      return;
    }

    executeCommand({ instruction });
  } catch (e) {
    if (!(e instanceof Error)) {
      console.log(`${answer}: An unknown error occured`);
      return;
    }
    if (instruction.redirectErrorTo) {
      writeFileSync(instruction.redirectErrorTo, `${e.message}\n`);
      return;
    }
    console.log(e.message);
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
