import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUserInput = async () => {
  rl.question("$ ", (answer) => {
    console.log(`${answer}: command not found`);
    promptUserInput();
  });
};

promptUserInput();
