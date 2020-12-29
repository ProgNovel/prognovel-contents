import fs from "fs";
import yaml from "js-yaml";
import { publishFiles, siteFiles, novelFiles } from "../_files";
import { errorSiteSettingsNotFound, failBuild } from "./build/fail";

export function checkValidBookFolder(novel: string) {
  let errors = [];
  let errorIndex = 0;
  let settings;
  let novelMetadata;
  try {
    settings = yaml.safeLoad(fs.readFileSync(siteFiles().settings));
  } catch (_) {
    errorSiteSettingsNotFound();
  }
  try {
    novelMetadata = yaml.safeLoad(fs.readFileSync(novelFiles(novel).metadata));
  } catch (_) {
    // TODO errorNovelSettingsNotFound!
    errorSiteSettingsNotFound();
  }

  const isInfoExist = fs.existsSync(novelFiles(novel).info);
  const isSynopsisExist = fs.existsSync(novelFiles(novel).synopsis);
  const isExistInSettings = settings.novels.includes(novel);
  const isTitleExist = novelMetadata.title;
  const isDemographyExist = novelMetadata.demography;
  const isGenreExist = novelMetadata.genre;

  if (!isInfoExist) errors[errorIndex++] = `${errorIndex}) info.yaml doesn\'t exist in folder ${novel}`;
  if (!isSynopsisExist) errors[errorIndex++] = `${errorIndex}) synopsis.md doesn\'t exist in folder ${novel}`;
  if (!isExistInSettings)
    errors[
      errorIndex++
    ] = `${errorIndex}) novel ${novel} is not defined in site-settings.yaml (check in root folder)`;

  if (errors.length) failBuild(errors, `${novel} error...`, { label: "crash" });

  return isInfoExist && isSynopsisExist && isExistInSettings;
}

export function ensurePublishDirectoryExist(novel?: string) {
  if (!fs.existsSync(publishFiles().folder)) {
    fs.mkdirSync(publishFiles().folder);
  }

  if (!novel) return;

  if (!fs.existsSync(publishFiles().novelFolder(novel))) {
    fs.mkdirSync(publishFiles().novelFolder(novel));
  }
}
