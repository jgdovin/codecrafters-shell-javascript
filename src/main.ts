import { exit } from "process";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const parsePrompt = (answer) => {
  const args = answer.split(" ");
  if (args[0] === "exit") {
    exit(args[1]);
  }
};

const promptUserInput = async () => {
  rl.question("$ ", (answer) => {
    parsePrompt(answer);
    console.log(`${answer}: command not found`);
    promptUserInput();
  });
};

promptUserInput();
