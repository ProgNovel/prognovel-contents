import chalk from "chalk";
import { cacheFiles, novelFiles } from "../_files";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { TypoUnregisteredContributor } from "../novels/types";

export async function fixTypo(opts?: any) {
  if (!existsSync(cacheFiles().typoCache)) {
    console.log("");
    console.log(
      "    " +
        chalk.bold.redBright(
          "No typo cache found. Make sure you're in the right folder and build the content first.",
        ),
    );
    return;
  }

  const typo = JSON.parse(readFileSync(cacheFiles().typoCache, "utf-8"));

  if (!Object.keys(typo).length) {
    console.log("");
    console.log(chalk.greenBright("  No typos found! Nice!"));

    return;
  }

  console.log("");
  console.log("");
  console.log(chalk.bgGreen.white(" FIXING TYPOS "));
  for (const id in typo) {
    replaceTypo(id, typo[id]);
  }
  console.log("");
  console.log("");

  // clear cache
  writeFileSync(cacheFiles().typoCache, "{}", "utf-8");
}

function replaceTypo(novelID: string, typos: TypoUnregisteredContributor[]) {
  console.log("");
  console.log(`(${novelID})`);
  typos.forEach(({ where, contributor, fixedName, rating }: TypoUnregisteredContributor) => {
    const [book, chapter] = where.split("/");
    const file = join(novelFiles(novelID).contentFolder, book, `${chapter}.md`);

    let data = readFileSync(file, "utf-8").replace(contributor, fixedName);
    writeFileSync(file, data, "utf-8");

    console.log(chalk.bold.green(`  > ${contributor} --> ${fixedName} (${where})`));
  });
}
