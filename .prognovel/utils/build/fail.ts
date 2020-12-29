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

export function errorNovelInfoNotFound(novel: string): void {
  failBuild([
    `Info file for novel ${novel} not found.`,
    "",
    `Make sure you have ${chalk.underline("info.yaml")} in the novel folder.`,
  ]);
}

interface failBuildOptions {
  label?: string;
  color?: ChalkFunction;
  labelColor?: ChalkFunction;
}

export function failBuild(reason: string | string[], title: string = "", opts?: failBuildOptions): void {
  const prefix = "  ";
  const color = opts?.color ?? chalk.red;
  const label = opts?.label ?? "error";
  const labelColor = opts?.labelColor ?? chalk.bgRed.white;

  console.log("");
  console.log("");
  console.log(prefix + labelColor(` ${label.toUpperCase()} `) + " " + title);
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
