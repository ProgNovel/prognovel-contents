const run = require("../.dist/main").build;

exports.command = "build";
exports.aliases = ["build", "b"];

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = function (argv) {
  run();
};

exports.describe =
  "Build static API from markdowns and calculate Web Monetization API revenue share contribution";

exports.run = run;
