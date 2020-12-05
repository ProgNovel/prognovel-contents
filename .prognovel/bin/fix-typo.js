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
  require("../.dist/main").fixTypo();
};

exports.describe =
  "Try to replace typos based on ProgNovel recommendation during the previous content building.";
