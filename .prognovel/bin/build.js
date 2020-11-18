exports.command = "build";
exports.aliases = ["build", "b"];

// exports.builder = {
//   banana: {
//     default: "cool",
//   },
//   batman: {
//     default: "sad",
//   },
// };

exports.handler = function (argv) {
  require("../.dist/main").build();
};

exports.describe =
  "Build static API from markdowns and calculate Web Monetization API revenue share contribution";
