import { exit } from "process";
import * as readline from "readline";

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
    console.log(`${args[0]}: not found`);
    return;
  },
};

const builtInCommands = Object.keys(builtInMethods);

const rl = readline.createInterface({
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
