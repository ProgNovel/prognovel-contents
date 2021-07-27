import fs from "fs";
import yaml from "js-yaml";
import { contributionRoles, revSharePerChapter } from "../novels/contributors";
import { errorSiteSettingsNotFound } from "../utils/build/fail";
import { ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";
import { publishFiles, siteFiles } from "../_files";

export function generateSiteSettings() {
  let settings;
  try {
    settings = yaml.load(fs.readFileSync(siteFiles().settings));
  } catch (_) {
    errorSiteSettingsNotFound();
  }

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
