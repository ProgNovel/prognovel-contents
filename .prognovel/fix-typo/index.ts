import chalk from "chalk";
import { files } from "../_shared";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { typoUnregisteredContributor } from "../novels/contributors";

export async function fixTypo(opts?: any) {
  if (!existsSync(files.cache().typoCache)) {
    console.log("");
    console.log(
      "    " +
        chalk.bold.redBright(
          "No typo cache found. Make sure you're in the right folder and build the content first.",
        ),
    );
    return;
  }

  const typo = JSON.parse(readFileSync(files.cache().typoCache, "utf-8"));

  if (!Object.keys(typo).length) {
    console.log("");
    console.log(chalk.greenBright("  No typos found! Nice!"));

    return;
  }

  console.log("");
  console.log("");
  console.log(chalk.bgGreen.white(" FIXING TYPOS "));
  for (const novel in typo) {
    replaceTypo(novel, typo[novel]);
  }
  console.log("");
  console.log("");

  // clear cache
  writeFileSync(files.cache().typoCache, "{}", "utf-8");
}

function replaceTypo(novel: string, typos: typoUnregisteredContributor[]) {
  console.log("");
  console.log(`(${novel})`);
  typos.forEach((typo: typoUnregisteredContributor) => {
    const [book, chapter] = typo.where.split("/");
    const file = join(files.novel(novel).contentFolder, book, `${chapter}.md`);

    let data = readFileSync(file, "utf-8").replace(typo.contributor, typo.fixedName);
    writeFileSync(file, data, "utf-8");

    console.log(chalk.bold.green(`  > ${typo.contributor} --> ${typo.fixedName} (${typo.where})`));
  });
}
