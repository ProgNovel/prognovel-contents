exports.command = "check";
exports.aliases = ["check", "c"];
const { fail } = require("./_errors");
// exports.builder = {
//   banana: {
//     default: "cool",
//   },
//   batman: {
//     default: "sad",
//   },
// };

exports.handler = function (argv) {
  try {
    require("../.dist/main").check();
  } catch (error) {
    fail();
  }
};

exports.describe =
  "Run a diagnosis on project to check whether there's any mistake on markdowns, contributors, etc. [WIP]";
