import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Uncomment this block to pass the first stage
rl.question("$ ", (answer) => {
  if (answer) {
    // test
    console.log(`${answer}: command not found`);
  }
  rl.close();
});
