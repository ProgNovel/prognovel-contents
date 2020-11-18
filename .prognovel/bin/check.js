exports.command = "check";
exports.aliases = ["check", "c"];

// exports.builder = {
//   banana: {
//     default: "cool",
//   },
//   batman: {
//     default: "sad",
//   },
// };

exports.handler = function (argv) {
  require("../.dist/main").check();
};

exports.describe =
  "Run a diagnosis on project to check whether there's any mistake on markdowns, contributors, etc. [WIP]";
