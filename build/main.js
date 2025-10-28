"use strict";

// src/main.ts
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
var checkPathForApp = ({
  command
}) => {
  const paths = process.env.PATH.split(":");
  for (const path of paths) {
    const filePath = `${path}/${command}`;
    if (hasPermission(filePath)) {
      return filePath;
    }
  }
  return null;
};

// src/main.ts
var import_child_process = require("child_process");

// src/built-ins.ts
var import_process = require("process");
var builtInCommands = ["echo", "exit", "type", "pwd", "cd"];
var isBuiltInCommand = (cmd) => {
  return builtInCommands.includes(cmd);
};
var builtInMethods = {
  echo: ({ instruction }) => {
    return instruction.args.join(" ");
  },
  exit: ({ instruction }) => {
    (0, import_process.exit)(instruction.args.join(" "));
  },
  type: ({ instruction }) => {
    const { args } = instruction;
    const argsStr = args.join(" ");
    if (!argsStr) {
      throw new Error("No command found, something went wrong.");
    }
    if (isBuiltInCommand(argsStr) && builtInCommands.includes(argsStr)) {
      return `${argsStr} is a shell builtin`;
    }
    const filePath = checkPathForApp({ command: args.join(" ") });
    if (filePath) {
      return `${argsStr} is ${filePath}`;
    }
    throw new Error(`${args[0]}: not found`);
  },
  pwd: () => {
    return process.cwd();
  },
  cd: ({ instruction }) => {
    const { args } = instruction;
    try {
      const homeDir = process.env.HOME;
      if (!homeDir) {
        throw new Error(
          "No home directory set for current user... How did that happen?"
        );
      }
      const path = args[0].replace("~", homeDir);
      process.chdir(path);
    } catch (e2) {
      if (e2 instanceof Error) {
        throw new Error(`cd: ${args[0]}: No such file or directory`);
      }
      throw new Error("Unknown error");
    }
  }
};

// node_modules/ts-pattern/dist/index.js
var t = Symbol.for("@ts-pattern/matcher");
var e = Symbol.for("@ts-pattern/isVariadic");
var n = "@ts-pattern/anonymous-select-key";
var r = (t2) => Boolean(t2 && "object" == typeof t2);
var i = (e2) => e2 && !!e2[t];
var o = (n2, s2, c2) => {
  if (i(n2)) {
    const e2 = n2[t](), { matched: r2, selections: i2 } = e2.match(s2);
    return r2 && i2 && Object.keys(i2).forEach((t2) => c2(t2, i2[t2])), r2;
  }
  if (r(n2)) {
    if (!r(s2)) return false;
    if (Array.isArray(n2)) {
      if (!Array.isArray(s2)) return false;
      let t2 = [], r2 = [], u = [];
      for (const o2 of n2.keys()) {
        const s3 = n2[o2];
        i(s3) && s3[e] ? u.push(s3) : u.length ? r2.push(s3) : t2.push(s3);
      }
      if (u.length) {
        if (u.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (s2.length < t2.length + r2.length) return false;
        const e2 = s2.slice(0, t2.length), n3 = 0 === r2.length ? [] : s2.slice(-r2.length), i2 = s2.slice(t2.length, 0 === r2.length ? Infinity : -r2.length);
        return t2.every((t3, n4) => o(t3, e2[n4], c2)) && r2.every((t3, e3) => o(t3, n3[e3], c2)) && (0 === u.length || o(u[0], i2, c2));
      }
      return n2.length === s2.length && n2.every((t3, e2) => o(t3, s2[e2], c2));
    }
    return Reflect.ownKeys(n2).every((e2) => {
      const r2 = n2[e2];
      return (e2 in s2 || i(u = r2) && "optional" === u[t]().matcherType) && o(r2, s2[e2], c2);
      var u;
    });
  }
  return Object.is(s2, n2);
};
var s = (e2) => {
  var n2, o2, u;
  return r(e2) ? i(e2) ? null != (n2 = null == (o2 = (u = e2[t]()).getSelectionKeys) ? void 0 : o2.call(u)) ? n2 : [] : Array.isArray(e2) ? c(e2, s) : c(Object.values(e2), s) : [];
};
var c = (t2, e2) => t2.reduce((t3, n2) => t3.concat(e2(n2)), []);
function a(t2) {
  return Object.assign(t2, { optional: () => h(t2), and: (e2) => d(t2, e2), or: (e2) => y(t2, e2), select: (e2) => void 0 === e2 ? v(t2) : v(e2, t2) });
}
function h(e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return void 0 === t2 ? (s(e2).forEach((t3) => r2(t3, void 0)), { matched: true, selections: n2 }) : { matched: o(e2, t2, r2), selections: n2 };
  }, getSelectionKeys: () => s(e2), matcherType: "optional" }) });
}
function d(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return { matched: e2.every((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "and" }) });
}
function y(...e2) {
  return a({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return c(e2, s).forEach((t3) => r2(t3, void 0)), { matched: e2.some((e3) => o(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, s), matcherType: "or" }) });
}
function p(e2) {
  return { [t]: () => ({ match: (t2) => ({ matched: Boolean(e2(t2)) }) }) };
}
function v(...e2) {
  const r2 = "string" == typeof e2[0] ? e2[0] : void 0, i2 = 2 === e2.length ? e2[1] : "string" == typeof e2[0] ? void 0 : e2[0];
  return a({ [t]: () => ({ match: (t2) => {
    let e3 = { [null != r2 ? r2 : n]: t2 };
    return { matched: void 0 === i2 || o(i2, t2, (t3, n2) => {
      e3[t3] = n2;
    }), selections: e3 };
  }, getSelectionKeys: () => [null != r2 ? r2 : n].concat(void 0 === i2 ? [] : s(i2)) }) });
}
function b(t2) {
  return true;
}
function w(t2) {
  return "number" == typeof t2;
}
function S(t2) {
  return "string" == typeof t2;
}
function j(t2) {
  return "bigint" == typeof t2;
}
var K = a(p(b));
var O = a(p(b));
var x = (t2) => Object.assign(a(t2), { startsWith: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.startsWith(n2)))));
  var n2;
}, endsWith: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.endsWith(n2)))));
  var n2;
}, minLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length >= t3))(e2))), length: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length === t3))(e2))), maxLength: (e2) => x(d(t2, ((t3) => p((e3) => S(e3) && e3.length <= t3))(e2))), includes: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && t3.includes(n2)))));
  var n2;
}, regex: (e2) => {
  return x(d(t2, (n2 = e2, p((t3) => S(t3) && Boolean(t3.match(n2))))));
  var n2;
} });
var A = x(p(S));
var N = (t2) => Object.assign(a(t2), { between: (e2, n2) => N(d(t2, ((t3, e3) => p((n3) => w(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 < t3))(e2))), gt: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 > t3))(e2))), lte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 <= t3))(e2))), gte: (e2) => N(d(t2, ((t3) => p((e3) => w(e3) && e3 >= t3))(e2))), int: () => N(d(t2, p((t3) => w(t3) && Number.isInteger(t3)))), finite: () => N(d(t2, p((t3) => w(t3) && Number.isFinite(t3)))), positive: () => N(d(t2, p((t3) => w(t3) && t3 > 0))), negative: () => N(d(t2, p((t3) => w(t3) && t3 < 0))) });
var P = N(p(w));
var k = (t2) => Object.assign(a(t2), { between: (e2, n2) => k(d(t2, ((t3, e3) => p((n3) => j(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 < t3))(e2))), gt: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 > t3))(e2))), lte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 <= t3))(e2))), gte: (e2) => k(d(t2, ((t3) => p((e3) => j(e3) && e3 >= t3))(e2))), positive: () => k(d(t2, p((t3) => j(t3) && t3 > 0))), negative: () => k(d(t2, p((t3) => j(t3) && t3 < 0))) });
var T = k(p(j));
var B = a(p(function(t2) {
  return "boolean" == typeof t2;
}));
var _ = a(p(function(t2) {
  return "symbol" == typeof t2;
}));
var W = a(p(function(t2) {
  return null == t2;
}));
var $ = a(p(function(t2) {
  return null != t2;
}));
var I = class extends Error {
  constructor(t2) {
    let e2;
    try {
      e2 = JSON.stringify(t2);
    } catch (n2) {
      e2 = t2;
    }
    super(`Pattern matching error: no pattern matches value ${e2}`), this.input = void 0, this.input = t2;
  }
};
var L = { matched: false, value: void 0 };
function M(t2) {
  return new R(t2, L);
}
var R = class _R {
  constructor(t2, e2) {
    this.input = void 0, this.state = void 0, this.input = t2, this.state = e2;
  }
  with(...t2) {
    if (this.state.matched) return this;
    const e2 = t2[t2.length - 1], r2 = [t2[0]];
    let i2;
    3 === t2.length && "function" == typeof t2[1] ? i2 = t2[1] : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
    let s2 = false, c2 = {};
    const u = (t3, e3) => {
      s2 = true, c2[t3] = e3;
    }, a2 = !r2.some((t3) => o(t3, this.input, u)) || i2 && !Boolean(i2(this.input)) ? L : { matched: true, value: e2(s2 ? n in c2 ? c2[n] : c2 : this.input, this.input) };
    return new _R(this.input, a2);
  }
  when(t2, e2) {
    if (this.state.matched) return this;
    const n2 = Boolean(t2(this.input));
    return new _R(this.input, n2 ? { matched: true, value: e2(this.input, this.input) } : L);
  }
  otherwise(t2) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  exhaustive(t2 = F) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  run() {
    return this.exhaustive();
  }
  returnType() {
    return this;
  }
  narrow() {
    return this;
  }
};
function F(t2) {
  throw new I(t2);
}

// src/types.ts
var SPECIAL_CHARS = {
  "'": "SINGLE_QUOTE" /* SINGLE_QUOTE */,
  '"': "DOUBLE_QUOTE" /* DOUBLE_QUOTE */,
  "\\": "BACKSLASH" /* BACKSLASH */,
  " ": "SPACE" /* SPACE */
};
var specialChars = Object.keys(SPECIAL_CHARS);
var OPERATORS = ["1>", ">", "2>", ">>", "1>>", "2>>"];

// src/operators.ts
var redirectOutput = ({ output, tokens, cursor }) => {
  output.redirectOutputTo = tokens.slice(cursor + 1, tokens.length).map((token) => token.value).join(" ").trim();
  return tokens.length;
};
var redirectError = ({ output, tokens, cursor }) => {
  output.redirectErrorTo = tokens.slice(cursor + 1, tokens.length).map((token) => token.value).join(" ").trim();
  return tokens.length;
};
var appendOutput = ({ output, tokens, cursor }) => {
  output.appendOutputTo = tokens.slice(cursor + 1, tokens.length).map((token) => token.value).join(" ").trim();
  return tokens.length;
};
var appendError = ({ output, tokens, cursor }) => {
  output.appendErrorTo = tokens.slice(cursor + 1, tokens.length).map((token) => token.value).join(" ").trim();
  return tokens.length;
};
var operatorMethods = {
  ">": redirectOutput,
  "1>": redirectOutput,
  "2>": redirectError,
  "1>>": appendOutput,
  ">>": appendOutput,
  "2>>": appendError
};
var matchOperator = ({
  input,
  cursor
}) => {
  const sortedOps = [...OPERATORS].sort((a2, b2) => b2.length - a2.length);
  for (const op of sortedOps) {
    const slice = input.slice(cursor, cursor + op.length);
    if (slice === op) {
      return op;
    }
  }
  return null;
};

// src/lexer.ts
var classifyChar = ({ char }) => {
  if (char in SPECIAL_CHARS) {
    const kind = SPECIAL_CHARS[char];
    return specialCharToCharType({ kind });
  }
  return { kind: "REGULAR" /* REGULAR */, char };
};
var specialCharToCharType = ({ kind }) => {
  return M(kind).with(
    "SINGLE_QUOTE" /* SINGLE_QUOTE */,
    () => ({ kind: "SINGLE_QUOTE" /* SINGLE_QUOTE */ })
  ).with("SPACE" /* SPACE */, () => ({ kind: "SPACE" /* SPACE */ })).with(
    "DOUBLE_QUOTE" /* DOUBLE_QUOTE */,
    () => ({ kind: "DOUBLE_QUOTE" /* DOUBLE_QUOTE */ })
  ).with("BACKSLASH" /* BACKSLASH */, () => ({ kind: "BACKSLASH" /* BACKSLASH */ })).exhaustive();
};
var ESCAPE_CHARACTER = "\\";
var ESCAPABLE_CHARACTERS = ['"', "\\"];
var tokenize = ({ input }) => {
  const tokens = [];
  let i2 = 0;
  while (i2 < input.length) {
    const operator = matchOperator({ input, cursor: i2 });
    if (operator) {
      tokens.push({ type: "OPERATOR" /* OPERATOR */, value: operator });
      i2 += operator.length;
      continue;
    }
    const charType = classifyChar({ char: input[i2] });
    M(charType).with({ kind: "SINGLE_QUOTE" /* SINGLE_QUOTE */ }, () => {
      const start = ++i2;
      while (i2 < input.length && input[i2] !== "'") i2++;
      tokens.push({ type: "QUOTED" /* QUOTED */, value: input.slice(start, i2) });
      i2++;
    }).with({ kind: "DOUBLE_QUOTE" /* DOUBLE_QUOTE */ }, () => {
      let output = "";
      i2++;
      while (i2 < input.length && input[i2] !== '"') {
        if (input[i2] === ESCAPE_CHARACTER && ESCAPABLE_CHARACTERS.includes(input[i2 + 1])) {
          output += input[i2 + 1];
          i2 += 2;
          continue;
        }
        output += input[i2];
        i2++;
      }
      tokens.push({ type: "QUOTED" /* QUOTED */, value: output });
      i2++;
    }).with({ kind: "REGULAR" /* REGULAR */ }, () => {
      const start = i2;
      while (i2 < input.length && !specialChars.includes(input[i2])) i2++;
      tokens.push({ type: "UNQUOTED" /* UNQUOTED */, value: input.slice(start, i2) });
    }).with({ kind: "SPACE" /* SPACE */ }, () => {
      tokens.push({ type: "WHITESPACE" /* WHITESPACE */, value: null });
      i2++;
    }).with({ kind: "BACKSLASH" /* BACKSLASH */ }, () => {
      tokens.push({
        type: "ESCAPED" /* ESCAPED */,
        value: input.slice(i2 + 1, i2 + 2)
      });
      i2 += 2;
    }).exhaustive();
  }
  return tokens;
};
var shouldBreak = false;
var tokensToInstruction = ({
  tokens
}) => {
  const command = tokens.shift();
  if (!command?.value) {
    throw new Error("We somehow do not have a command");
  }
  const output = {
    command: command.value,
    args: [],
    redirectOutputTo: null,
    redirectErrorTo: null,
    appendOutputTo: null,
    appendErrorTo: null
  };
  let currentArg = "";
  for (let i2 = 0; i2 < tokens.length; i2++) {
    if (shouldBreak) {
      shouldBreak = false;
      break;
    }
    const token = tokens[i2];
    M(token).with(
      { type: "QUOTED" /* QUOTED */ },
      { type: "UNQUOTED" /* UNQUOTED */ },
      { type: "ESCAPED" /* ESCAPED */ },
      (token2) => {
        currentArg += token2.value;
      }
    ).with({ type: "WHITESPACE" /* WHITESPACE */ }, () => {
      if (currentArg !== "") {
        output.args.push(currentArg);
        currentArg = "";
      }
    }).with({ type: "OPERATOR" /* OPERATOR */ }, (token2) => {
      if (currentArg !== "") {
        output.args.push(currentArg);
        currentArg = "";
      }
      if (!token2.value) {
        throw new Error("No token found. Should be unreachable.");
      }
      if (token2.value in operatorMethods) {
        i2 += operatorMethods[token2.value]({
          output,
          tokens,
          cursor: i2
        });
      }
      return;
    }).exhaustive();
  }
  if (currentArg !== "") {
    output.args.push(currentArg);
  }
  return output;
};

// src/main.ts
var import_fs2 = require("fs");
var completer = (line) => {
  const hits = builtInCommands.filter((command) => command.startsWith(line)).map((command) => `${command} `);
  if (!hits.length) {
    process.stdout.write("\x07");
  }
  return [hits.length ? hits : builtInCommands, line];
};
var rl = (0, import_readline.createInterface)({
  input: process.stdin,
  output: process.stdout,
  completer
});
var getStdoutTarget = ({ instruction }) => {
  if (instruction.redirectOutputTo) {
    return (0, import_fs2.openSync)(instruction.redirectOutputTo, "w");
  }
  if (instruction.appendOutputTo) {
    return (0, import_fs2.openSync)(instruction.appendOutputTo, "a");
  }
  return "inherit";
};
var getSderrTarget = ({ instruction }) => {
  if (instruction.redirectErrorTo) {
    return (0, import_fs2.openSync)(instruction.redirectErrorTo, "w");
  }
  if (instruction.appendErrorTo) {
    return (0, import_fs2.openSync)(instruction.appendErrorTo, "a");
  }
  return "inherit";
};
var executeCommand = ({ instruction }) => {
  const { command } = instruction;
  const filePath = checkPathForApp({ command });
  if (!filePath) throw new Error(`${command}: command not found`);
  const stdoutTarget = getStdoutTarget({ instruction });
  const stderrTarget = getSderrTarget({ instruction });
  (0, import_child_process.spawnSync)(`${command}`, instruction.args, {
    encoding: "utf-8",
    stdio: ["inherit", stdoutTarget, stderrTarget]
  });
};
var parsePrompt = async (answer) => {
  const tokens = tokenize({ input: answer });
  const instruction = tokensToInstruction({ tokens });
  try {
    if (instruction.redirectErrorTo) {
      (0, import_fs2.writeFileSync)(instruction.redirectErrorTo, "");
    }
    if (isBuiltInCommand(instruction.command)) {
      const output = builtInMethods[instruction.command]({
        instruction
      });
      const target = getStdoutTarget({ instruction });
      if (target !== "inherit") {
        (0, import_fs2.writeSync)(target, `${output}
`);
        return;
      }
      if (!output) {
        return;
      }
      console.log(output);
      return;
    }
    executeCommand({ instruction });
  } catch (e2) {
    if (!(e2 instanceof Error)) {
      console.log(`${answer}: An unknown error occured`);
      return;
    }
    const target = getSderrTarget({ instruction });
    if (target !== "inherit") {
      (0, import_fs2.writeSync)(target, `${e2.message}
`);
      return;
    }
    console.log(e2.message);
  }
  return;
};
var promptUserInput = () => {
  rl.question("$ ", async (answer) => {
    await parsePrompt(answer);
    promptUserInput();
  });
};
promptUserInput();
