import fs from "fs";
import chalk from "chalk";
import yaml from "js-yaml";
import { publishFiles, siteFiles, novelFiles } from "../_files";

export function checkValidBookFolder(novel: string) {
  const settings = yaml.safeLoad(fs.readFileSync(siteFiles().settings));

  const isInfoExist = fs.existsSync(novelFiles(novel).info);
  const isSynopsisExist = fs.existsSync(novelFiles(novel).synopsis);
  const isExistInSettings = settings.novels.includes(novel);

  if (!isInfoExist) console.error(chalk.bold.red(`info.yml doesn\'t exist in folder ${novel}`));
  if (!isSynopsisExist) console.error(chalk.bold.red(`synopsis.md doesn\'t exist in folder ${novel}`));
  if (!isExistInSettings)
    console.error(
      chalk.bold.yellow(`novel ${novel} is not defined in site-settings.yaml (check in root folder)`),
    );

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
