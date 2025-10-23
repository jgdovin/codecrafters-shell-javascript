var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_process = require("process");
var readline = __toESM(require("readline"));
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
var parsePrompt = (answer) => {
  let validCommand = false;
  const args = answer.split(" ");
  if (args[0] === "exit") {
    (0, import_process.exit)(args[1]);
  }
  if (args[0] === "echo") {
    console.log(args.slice(1).join(" "));
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
