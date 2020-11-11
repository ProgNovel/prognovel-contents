const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { WORKING_FOLDER } = require("../prognovel.config");

function generateSiteSettings() {
  const settingsFile = path.resolve(__dirname, "../../site-settings.yml");
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile));

  if (!settings.cors) settings.cors = "*";
  settings.contribution_roles = settings["rev_share_contribution_per_chapter"]
    ? Object.keys(settings["rev_share_contribution_per_chapter"])
    : [];
  fs.writeFileSync(
    path.resolve(WORKING_FOLDER, "../sitemetadata.json"),
    JSON.stringify(settings, null, 4),
  );

  global.contribution_roles = settings.contribution_roles;
  global.rev_share_per_chapter = settings["rev_share_contribution_per_chapter"];

  return settings;
}

module.exports = generateSiteSettings;
