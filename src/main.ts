import { AsyncCompleter, createInterface } from "readline";
import { checkPathForApp, checkPathForAutocomplete } from "./utils";
import { spawnSync } from "child_process";
import {
  builtInMethods,
  checkBuiltinsForAutocomplete,
  isBuiltInCommand,
} from "./built-ins";
import { tokensToInstruction, tokenize } from "./lexer";
import { Instruction } from "./types";
import { openSync, writeFileSync, writeSync } from "fs";

const findCommonPrefix = ({ strings }: { strings: string[] }): string => {
  if (strings.length < 2) return "";

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (strings[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === "") return "";
    }
  }
  return prefix;
};

const completer: AsyncCompleter = (line, callback) => {
  const matches: Set<string> = new Set();

  checkBuiltinsForAutocomplete({ line }).forEach((command) =>
    matches.add(command)
  );

  checkPathForAutocomplete({ line }).forEach((command) => matches.add(command));

  const matchArr = Array.from(matches).sort();

  if (!matches.size) {
    process.stdout.write("\u0007");
    return callback(null, [[], line]);
  }

  if (matchArr.length === 1) {
    return callback(null, [[`${matchArr[0]} `], line]);
  }

  process.stdout.write("\u0007");

  const commonPrefix = findCommonPrefix({ strings: matchArr });
  if (commonPrefix.length > line.length) {
    return callback(null, [[commonPrefix], line]);
  }

  process.stdout.write("\r\n" + matchArr.join("  ") + "\r\n$ " + line);

  return callback(null, [[line], line]);
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
