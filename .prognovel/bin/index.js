#!/usr/bin/env node

if (process.argv.slice(-1)[0].endsWith("index.js")) {
  require("./build").run();
  return;
}

require("yargs")
  .scriptName("prognovel")
  .usage(`Usage: prognovel <command> [option (if any)]`)
  .command(require("./init"))
  .command(require("./build"))
  .command(require("./fix-typo"))
  .command(require("./check")).argv;
