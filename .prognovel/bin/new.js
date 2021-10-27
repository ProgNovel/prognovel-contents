exports.command = "new";
// exports.aliases = ["build", "b"];
const { failBuild } = require("../.dist/fail");
const { existsSync, mkdirSync, writeFileSync, copyFileSync } = require("fs");
const { siteSettingsContent, siteContributorsContent, siteFilesContent } = require("./_new-files");

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = async function ({ _ }) {
  if (_.length > 1)
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
  try {
    mkdirSync(process.cwd() + "/novels");
  } catch (error) {}
  Object.keys(siteFilesContent).forEach((file) => {
    writeFileSync(file, siteFilesContent[file], "utf-8");
  });
  copyFileSync(require.main.path + "/assets/favicon.png", "favicon.png");
  copyFileSync(require.main.path + "/assets/logo.png", "logo.png");
};

exports.describe = "Create a blank ProgNovel project.";
