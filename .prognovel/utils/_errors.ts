import chalk from "chalk";

export function workingFolderNotFound() {
  console.log(".");
  console.log(".");
  console.log("-------------------------------------");
  console.log("|  ", chalk.bold.red("Error!"), "                         |");
  console.log("|    ", chalk.underline.bold("working folder not found"), "     |");
  console.log("-------------------------------------");
  console.log("");
  console.log('%cMake sure you put your novels in "novels" directory.', '"color: green"');
}
