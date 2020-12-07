import chalk, { ChalkFunction } from "chalk";
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

export function errorSiteSettingsNotFound(): void {
  failBuild([
    "site-settings.yaml not found in your project's root folder.",
    "",
    `Make sure you're in the right folder or use command ${chalk.underline(
      "prognovel init",
    )} to create a new one in this folder.`,
  ]);
}

interface failBuildOptions {
  label?: string;
  color?: ChalkFunction;
}

export function failBuild(reason: string | string[], title: string = "", opts?: failBuildOptions): void {
  const prefix = "  ";
  const color = opts?.color ?? chalk.red;
  const label = opts?.label ?? "error";

  console.log("");
  console.log("");
  console.log(prefix + chalk.bgRed.white(` ${label.toUpperCase} `) + " " + title);
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
