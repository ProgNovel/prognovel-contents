exports.command = "init";
exports.aliases = ["init", "i"];

// exports.builder = {
//   banana: {
//     default: "cool",
//   },
//   batman: {
//     default: "sad",
//   },
// };

exports.handler = function (argv) {
  require("../.dist/main").init();
};

exports.describe = "Initialize a ProgNovel project in an empty folder.";
