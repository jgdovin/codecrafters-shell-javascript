import { createInterface } from "readline";
import { checkPathForApp, tokenize, tokensToArgs } from "./utils";
import { spawnSync } from "child_process";
import { builtInCommands, builtInMethods } from "./built-ins";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parsePrompt = async (answer: string) => {
  const args = tokensToArgs({ tokens: tokenize({ input: answer }) });

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
