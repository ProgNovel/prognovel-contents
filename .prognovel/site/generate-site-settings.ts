import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { contributionRoles, revSharePerChapter } from "../novels/contributors";
import { ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";

export function generateSiteSettings() {
  const settingsFile = path.join(process.cwd(), "/site-settings.yml");
  console.log("Generating site metadata from site-settings.yml at", settingsFile);
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile));

  if (!settings.cors) settings.cors = "*";
  settings.contribution_roles = settings["rev_share_contribution_per_chapter"]
    ? Object.keys(settings["rev_share_contribution_per_chapter"])
    : [];

  const publishFolder = path.join(process.cwd(), "/.publish");
  ensurePublishDirectoryExist();
  const metadataFile = path.resolve(publishFolder, "/sitemetadata.json");
  // console.log(metadataFile);
  fs.writeFileSync(metadataFile, JSON.stringify(settings, null, 4));

  contributionRoles.set(settings.contribution_roles);
  revSharePerChapter.set(settings["rev_share_contribution_per_chapter"]);

  return settings;
}
