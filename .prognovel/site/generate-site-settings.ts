import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { contributionRoles, revSharePerChapter } from "../novels/contributors";

export function generateSiteSettings() {
  const settingsFile = path.resolve(__dirname, "../../site-settings.yml");
  console.log("Generating site metadata from site-settings.yml");
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile));

  if (!settings.cors) settings.cors = "*";
  settings.contribution_roles = settings["rev_share_contribution_per_chapter"]
    ? Object.keys(settings["rev_share_contribution_per_chapter"])
    : [];

  const metadataFile = path.resolve(__dirname, "../../sitemetadata.json");
  console.log(metadataFile);
  fs.writeFileSync(metadataFile, JSON.stringify(settings, null, 4));

  contributionRoles.set(settings.contribution_roles);
  revSharePerChapter.set(settings["rev_share_contribution_per_chapter"]);

  return settings;
}
