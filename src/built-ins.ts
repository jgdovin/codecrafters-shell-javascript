import { exit } from "process";
import { checkPathForApp } from "./utils";
import { Args, BuiltInMethod } from "./types";

export const builtInMethods: Record<string, BuiltInMethod> = {
  echo: ({ args }: Args) => {
    console.log(args.join(" "));
  },
  exit: ({ args }: Args) => {
    exit(args[1]);
  },
  type: ({ args }: Args) => {
    if (builtInCommands.includes(args[1])) {
      console.log(`${args[1]} is a shell builtin`);
      return;
    }

    const command = args[1];

    const filePath = checkPathForApp({ command });

    if (filePath) {
      console.log(`${command} is ${filePath}`);
      return;
    }

    console.log(`${args[1]}: not found`);
  },
  pwd: () => {
    console.log(process.cwd());
  },
  cd: ({ args }: Args) => {
    try {
      const path = args[0].replace("~", process.env.HOME);
      process.chdir(path);
    } catch (e) {
      console.log(`cd: ${args[1]}: No such file or directory`);
    }
  },
};

export const builtInCommands = Object.keys(builtInMethods);
