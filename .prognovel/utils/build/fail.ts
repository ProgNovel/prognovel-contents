import chalk from "chalk";
import { imageExt, NovelImageType } from "../../_files";

export function errorImageNotFound(novel: string, imageType: NovelImageType) {
  failBuild([
    `${imageType} image not found in folder ${novel}.`,
    `make sure image file with name ${chalk.underline(
      imageType,
    )} exists, with extensions one of the following:`,
    " - " + imageExt.join(", "),
  ]);
}

export function failBuild(reason: string | string[], color = chalk.red) {
  const prefix = "  ";
  console.log("");
  console.log("");
  console.log(prefix + chalk.bgRed.white(" ERROR "));
  console.log("");
  if (Array.isArray(reason)) {
    reason.forEach((text) => {
      console.log(color(prefix + text));
    });
  } else {
    console.log(color(prefix + reason));
  }
  console.log("");
  console.log("");
  process.exit();
}
