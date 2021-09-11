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

  if (!settings.global_payment_pointers) {
    console.error("no global payment pointers found");
    process.exit();
  }

  if (!settings.limit_global_payment_pointers_share_in_novel) {
    console.error("no limit setting for global payment pointers found");
    process.exit();
  }

  return settings;
}
