import { exit } from "process";
import { checkPathForApp } from "./utils";
interface Args {
  args: string[];
}

export const builtInMethods = {
  echo: ({ args }: Args) => {
    console.log(args.slice(1).join(" "));
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
      const path = args[1].replace("~", process.env.HOME);
      process.chdir(path);
    } catch (e) {
      console.log(`cd: ${args[1]}: No such file or directory`);
    }
  },
};

export const builtInCommands = Object.keys(builtInMethods);
