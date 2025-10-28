import { createInterface } from "readline";
import { checkPathForApp } from "./utils";
import { spawnSync } from "child_process";
import { builtInCommands, builtInMethods, isBuiltInCommand } from "./built-ins";
import { tokensToInstruction, tokenize } from "./lexer";
import { Instruction } from "./types";
import { openSync, writeFileSync, writeSync } from "fs";

const completer = (line: string) => {
  const hits = builtInCommands
    .filter((command) => command.startsWith(line))
    .map((command) => `${command} `);
  if (!hits.length) {
    process.stdout.write("\u0007");
  }
  return [hits.length ? hits : builtInCommands, line];
};

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  completer,
});

const getStdoutTarget = ({ instruction }: { instruction: Instruction }) => {
  if (instruction.redirectOutputTo) {
    return openSync(instruction.redirectOutputTo, "w");
  }
  if (instruction.appendOutputTo) {
    return openSync(instruction.appendOutputTo, "a");
  }
  return "inherit";
};

const getSderrTarget = ({ instruction }: { instruction: Instruction }) => {
  if (instruction.redirectErrorTo) {
    return openSync(instruction.redirectErrorTo, "w");
  }
  if (instruction.appendErrorTo) {
    return openSync(instruction.appendErrorTo, "a");
  }
  return "inherit";
};

const executeCommand = ({ instruction }: { instruction: Instruction }) => {
  const { command } = instruction;

  const filePath = checkPathForApp({ command });

  if (!filePath) throw new Error(`${command}: command not found`);
  const stdoutTarget = getStdoutTarget({ instruction });

  const stderrTarget = getSderrTarget({ instruction });

  spawnSync(`${command}`, instruction.args, {
    encoding: "utf-8",
    stdio: ["inherit", stdoutTarget, stderrTarget],
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

    if (isBuiltInCommand(instruction.command)) {
      const output = builtInMethods[instruction.command]({
        instruction,
      });

      const target = getStdoutTarget({ instruction });

      if (target !== "inherit") {
        writeSync(target, `${output}\n`);
        return;
      }

      if (!output) {
        return;
      }

      console.log(output);
      return;
    }

    executeCommand({ instruction });
  } catch (e) {
    if (!(e instanceof Error)) {
      console.log(`${answer}: An unknown error occured`);
      return;
    }
    const target = getSderrTarget({ instruction });

    if (target !== "inherit") {
      writeSync(target, `${e.message}\n`);
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
