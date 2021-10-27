const { fail } = require("./_errors");

exports.command = "fix-typo";
exports.aliases = ["typo", "ft"];

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
    require("../.dist/main").fixTypo();
  } catch (error) {
    fail();
  }
};

exports.describe =
  "Try to replace typos based on ProgNovel recommendation during the previous content building.";
