import { exit } from "process";
import { checkPathForApp } from "./utils";
interface Args {
  args: string[];
}

export const builtInMethods = {
  echo: ({ args }: Args) => {
    console.log(args.slice(1).join(" "));
    return;
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
    return;
  },
  pwd: () => {
    console.log(process.cwd());
    return;
  },
};

export const builtInCommands = Object.keys(builtInMethods);
