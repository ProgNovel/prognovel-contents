import fs from "fs";
import yaml from "js-yaml";
import { publishFiles, siteFiles, novelFiles } from "../_files";
import { errorNovelInfoNotFound, errorSiteSettingsNotFound, failBuild } from "./build/fail";

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
    novelMetadata = yaml.safeLoad(fs.readFileSync(novelFiles(novel).info));
  } catch (_) {
    // TODO errorNovelSettingsNotFound!
    errorNovelInfoNotFound(novel);
  }

  const isInfoExist = fs.existsSync(novelFiles(novel).info);
  const isSynopsisExist = fs.existsSync(novelFiles(novel).synopsis);
  const isExistInSettings = settings.novels.includes(novel);
  const isTitleExist = novelMetadata.title;
  const isDemographicExist = novelMetadata.demography;
  const isGenreExist = novelMetadata.genre;

  if (!isInfoExist) errors[errorIndex++] = `${errorIndex}) info.yaml doesn\'t exist in folder ${novel}`;
  if (!isSynopsisExist) errors[errorIndex++] = `${errorIndex}) synopsis.md doesn\'t exist in folder ${novel}`;
  if (!isExistInSettings)
    errors[
      errorIndex++
    ] = `${errorIndex}) novel ${novel} is not defined in site-settings.yaml (check in root folder)`;
  if (!isTitleExist) errors[errorIndex++] = `${errorIndex}) can't found title in info.yaml.`;
  if (!isGenreExist) errors[errorIndex++] = `${errorIndex}) can't found genre in info.yaml.`;
  if (!isDemographicExist) errors[errorIndex++] = `${errorIndex}) can't found demographic in info.yaml.`;
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
