import fs from "fs";
import chalk from "chalk";
import yaml from "js-yaml";
import path from "path";

export function checkValidBookFolder(folder) {
  const settingsFile = path.resolve(__dirname, "../../site-settings.yml");
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile));

  const isInfoExist = fs.existsSync(folder + "/info.yml");
  const isSynopsisExist = fs.existsSync(folder + "/synopsis.md");
  const isExistInSettings = settings.novels.includes(folder.split("novels/")[1]);

  if (!isInfoExist) console.error(chalk.bold.red(`info.yml doesn\'t exist at ${folder}`));
  if (!isSynopsisExist) console.error(chalk.bold.red(`synopsis.md doesn\'t exist at ${folder}`));
  if (!isExistInSettings)
    console.error(
      chalk.bold.yellow(
        `novel ${folder} is not defined in site-settings.yaml (check in root folder)`,
      ),
    );

  return isInfoExist && isSynopsisExist && isExistInSettings;
}
