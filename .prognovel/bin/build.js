const { fail } = require("./_errors");

exports.command = "build";
exports.aliases = ["build", "b"];

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = function (argv) {
  try {
    require("../.dist/main").build();
  } catch (error) {
    fail();
  }
};

exports.describe =
  "Build static API from markdowns and calculate Web Monetization API revenue share contribution";
