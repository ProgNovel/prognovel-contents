exports.command = "new";
// exports.aliases = ["build", "b"];
const { failBuild } = require("../.dist/fail");
const { existsSync, mkdirSync, writeFileSync } = require("fs");
const { siteSettingsContent, siteContributorsContent } = require("./_new-files");

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
  if (_.length > 2)
    failBuild(
      `To create a new project, use "prognovel new [your-project-title]".
  No spaces allowed for your project title.`,
      "parameter too long",
    );

  if (existsSync("site-settings.yml") || existsSync("site-settings.yaml")) {
    failBuild(
      "Settings files for ProgNovel project found - make sure to create a project on a blank folder.",
      "project already exists",
    );
  }
  mkdirSync(process.cwd() + "/novels");
  writeFileSync("site-settings.yml", siteSettingsContent);
  writeFileSync("site-contributors.yml", siteContributorsContent);
};

exports.describe = "Create a blank ProgNovel project.";
