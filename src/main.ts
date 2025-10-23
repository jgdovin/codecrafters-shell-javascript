import { exit } from "process";
import { createInterface } from "readline";
import { checkPathForApp } from "./utils";
import { spawnSync } from "child_process";
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

    const filePath = checkPathForApp({ command });

    if (filePath) {
      console.log(`${command} is ${filePath}`);
      return;
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

const parsePrompt = async (answer: string) => {
  const args = answer.split(" ");

  if (builtInCommands.includes(args[0])) {
    builtInMethods[args[0]]({ args });
    return;
  }

  const command = args.shift();
  const filePath = checkPathForApp({ command });

  try {
    if (!filePath) throw new Error("command not found");
    spawnSync(`${command}`, args, {
      encoding: "utf-8",
      stdio: "inherit",
    });
  } catch (e) {
    console.log(`${answer}: ${e.message}`);
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
