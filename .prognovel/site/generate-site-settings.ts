import fs from "fs";
import yaml from "js-yaml";
import { contributionRoles, revSharePerChapter } from "../novels/contributors";
import { ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";
import { publishFiles, siteFiles } from "../_files";

export function generateSiteSettings() {
  const settings = yaml.safeLoad(fs.readFileSync(siteFiles().settings));

  if (!settings.cors) settings.cors = "*";
  settings.contribution_roles = settings["rev_share_contribution_per_chapter"]
    ? Object.keys(settings["rev_share_contribution_per_chapter"])
    : [];

  ensurePublishDirectoryExist();
  fs.writeFileSync(publishFiles().siteMetadata, JSON.stringify(settings, null, 4));

  contributionRoles.set(settings.contribution_roles);
  revSharePerChapter.set(settings["rev_share_contribution_per_chapter"]);

  return settings;
}
