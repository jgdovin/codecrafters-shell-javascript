import { existsSync } from "fs";
import { exit } from "process";
import { createInterface } from "readline";
import { hasPermission } from "./utils";

interface Args {
  args: string[];
}

const builtInMethods = {
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
    const paths = process.env.PATH.split(":");

    for (const path of paths) {
      const filePath = `${path}/${command}`;
      if (hasPermission(filePath)) {
        console.log(`${command} is ${filePath}`);
        return;
      }
    }

    console.log(`${args[1]}: not found`);
    return;
  },
};

const builtInCommands = Object.keys(builtInMethods);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parsePrompt = (answer: string) => {
  const args = answer.split(" ");

  if (builtInCommands.includes(args[0])) {
    builtInMethods[args[0]]({ args });
    return;
  }
  console.log(`${answer}: command not found`);
};

const promptUserInput = async () => {
  rl.question("$ ", (answer) => {
    parsePrompt(answer);
    promptUserInput();
  });
};

promptUserInput();
