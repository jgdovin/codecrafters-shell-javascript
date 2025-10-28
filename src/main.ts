import { createInterface } from "readline";
import { checkPathForApp, checkPathForAutocomplete } from "./utils";
import { spawnSync } from "child_process";
import {
  builtInCommands,
  builtInMethods,
  checkBuiltinsForAutocomplete,
  isBuiltInCommand,
} from "./built-ins";
import { tokensToInstruction, tokenize } from "./lexer";
import { Instruction } from "./types";
import { openSync, writeFileSync, writeSync } from "fs";

const completer = (line: string) => {
  const matches: Set<string> = new Set();

  checkBuiltinsForAutocomplete({ line }).forEach((command) =>
    matches.add(command)
  );
  checkPathForAutocomplete({ line }).forEach((command) =>
    matches.add(`${command} `)
  );

  if (!matches.size) {
    process.stdout.write("\u0007");
  }
  return [matches.size ? Array.from(matches) : builtInCommands, line];
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

      process.stdout.write(output + "\n");
      return;
    }

    executeCommand({ instruction });
  } catch (e) {
    if (!(e instanceof Error)) {
      process.stderr.write(`${answer}: An unknown error occured\n`);
      return;
    }
    const target = getSderrTarget({ instruction });

    if (target !== "inherit") {
      writeSync(target, `${e.message}\n`);
      return;
    }
    process.stderr.write(e.message + "\n");
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
