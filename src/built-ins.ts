import { exit } from "process";
import { checkPathForApp } from "./utils";
import { BuiltInMethodArgs, BuiltInMethod } from "./types";

export const builtInCommands = ["echo", "exit", "type", "pwd", "cd"] as const;
type BuiltInCommandName = (typeof builtInCommands)[number];

export const isBuiltInCommand = (cmd: string): cmd is BuiltInCommandName => {
  return builtInCommands.includes(cmd as BuiltInCommandName);
};

export const builtInMethods: Record<BuiltInCommandName, BuiltInMethod> = {
  echo: ({ instruction }: BuiltInMethodArgs): string => {
    return instruction.args.join(" ");
  },
  exit: ({ instruction }: BuiltInMethodArgs): void => {
    exit(instruction.args.join(" "));
  },
  type: ({ instruction }: BuiltInMethodArgs): string => {
    const { args } = instruction;
    const argsStr = args.join(" ");

    if (!argsStr) {
      throw new Error("No command found, something went wrong.");
    }

    if (isBuiltInCommand(argsStr) && builtInCommands.includes(argsStr)) {
      return `${argsStr} is a shell builtin`;
    }

    const filePath = checkPathForApp({ command: args.join(" ") });

    if (filePath) {
      return `${argsStr} is ${filePath}`;
    }

    throw new Error(`${args[0]}: not found`);
  },
  pwd: (): string => {
    return process.cwd();
  },
  cd: ({ instruction }: BuiltInMethodArgs): void => {
    const { args } = instruction;

    try {
      const homeDir = process.env.HOME;
      if (!homeDir) {
        throw new Error(
          "No home directory set for current user... How did that happen?"
        );
      }
      const path = args[0].replace("~", homeDir);
      process.chdir(path);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`cd: ${args[0]}: No such file or directory`);
      }
      throw new Error("Unknown error");
    }
  },
} as const satisfies Record<string, BuiltInMethod>;
