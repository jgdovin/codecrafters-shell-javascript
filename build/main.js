// src/main.ts
var import_process = require("process");
var import_readline = require("readline");

// src/utils.ts
var import_fs = require("fs");
var hasPermission = (path, mode = import_fs.constants.X_OK) => {
  try {
    (0, import_fs.accessSync)(path, mode);
    return true;
  } catch {
    return false;
  }
};

// src/main.ts
var builtInMethods = {
  echo: ({ args }) => {
    console.log(args.slice(1).join(" "));
    return;
  },
  exit: ({ args }) => {
    (0, import_process.exit)(args[1]);
  },
  type: ({ args }) => {
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
  }
};
var builtInCommands = Object.keys(builtInMethods);
var rl = (0, import_readline.createInterface)({
  input: process.stdin,
  output: process.stdout
});
var parsePrompt = (answer) => {
  const args = answer.split(" ");
  if (builtInCommands.includes(args[0])) {
    builtInMethods[args[0]]({ args });
    return;
  }
  console.log(`${answer}: command not found`);
};
var promptUserInput = async () => {
  rl.question("$ ", (answer) => {
    parsePrompt(answer);
    promptUserInput();
  });
};
promptUserInput();
