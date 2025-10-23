import { exit } from "process";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parsePrompt = (answer: string) => {
  let validCommand = false;
  const args = answer.split(" ");
  if (args[0] === "exit") {
    exit(args[1]);
  }

  if (args[0] === "echo") {
    console.log(args.slice(1).join(" "));
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
