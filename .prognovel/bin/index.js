#!/usr/bin/env node

require("yargs")
  .scriptName("prognovel")
  .usage(`Usage: prognovel <command> [option (if any)]`)
  .command(require("./init"))
  .command(require("./build"))
  .command(require("./check")).argv;
