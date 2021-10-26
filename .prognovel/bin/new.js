exports.command = "new";
// exports.aliases = ["build", "b"];
const { failBuild } = require("../.dist/main");

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = async function ({ _ }) {
  const title = _[1];
  if (!title)
    failBuild(
      'Make sure to add your project title, no space allowed. Use dash "-" instead of space. \n  Example: a novel with title My New Novel would be my-new-novel as its ID.',
      "title error",
    );
  if (_.length > 2) console.log("parameter takes too long");
  console.log({ novel: title });
};

exports.describe = "Create a blank ProgNovel project.";
