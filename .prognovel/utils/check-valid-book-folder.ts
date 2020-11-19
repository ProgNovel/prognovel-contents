import fs from "fs";
import chalk from "chalk";
import yaml from "js-yaml";
import path from "path";

export function checkValidBookFolder(folder) {
  const settingsFile = path.join(process.cwd(), "/site-settings.yml");
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile));

  const isInfoExist = fs.existsSync(folder + "/info.yml");
  const isSynopsisExist = fs.existsSync(folder + "/synopsis.md");
  const isExistInSettings = settings.novels.includes(folder.split("novels/")[1]);

  if (!isInfoExist) console.error(chalk.bold.red(`info.yml doesn\'t exist at ${folder}`));
  if (!isSynopsisExist) console.error(chalk.bold.red(`synopsis.md doesn\'t exist at ${folder}`));
  if (!isExistInSettings)
    console.error(
      chalk.bold.yellow(`novel ${folder} is not defined in site-settings.yaml (check in root folder)`),
    );

  return isInfoExist && isSynopsisExist && isExistInSettings;
}

export function ensurePublishDirectoryExist(novel?: string) {
  const folder: { publish: string; novel?: string } = {
    publish: path.join(process.cwd(), "/.publish"),
  };

  if (!fs.existsSync(folder.publish)) {
    fs.mkdirSync(folder.publish);
  }

  if (!novel) return;
  folder.novel = path.join(folder.publish, `/${novel}`);
  // console.log("creating folder", folder.novel);

  if (!fs.existsSync(folder.novel)) {
    fs.mkdirSync(folder.novel);
  }
}
