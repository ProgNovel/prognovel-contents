import fs from "fs";
import yaml from "js-yaml";
import fm from "front-matter";
import { matter } from "wasm-frontmatter";
import md from "marked";
import globby from "globby";
import { performance } from "perf_hooks";
import { checkValidBookFolder } from "../utils/check-valid-book-folder";
import { generateBookCover } from "./generate-cover";
import chalk from "chalk";
import { contributionRoles, revSharePerChapter, contributors } from "./contributors";

export async function generateMetadata(novels: string[]) {
  const firstNovel = novels[0];
  const folders = await globby("novels/*", { onlyDirectories: true, unique: true });
  // console.log("Detecting folders:", folders);
  return Promise.all(
    folders.map(async (folder) => {
      let folderName: string[] | string = folder.split("/");
      folderName = folderName[folderName.length - 1];
      if (novels.includes(folderName)) {
        if (checkValidBookFolder(folder)) {
          novels = novels.filter((novel) => novel !== folderName);

          appendGlobalNovelMetadata(folder);

          // TODO refactor placeholder ratio in prognovel.config.js
          const placeholderRatio = firstNovel === folderName ? 2 : 1;
          const images = await generateBookCover(folder + "/cover.jpg", placeholderRatio);
          return await compileChapter(folder, images, folderName);
        }
      }
      return {};
    }),
  );
  if (novels.length) console.log(novels, "fails to generate.");

  function appendGlobalNovelMetadata(folder) {
    const novel = folder.split("novels/")[1];
    let novelContributors;
    try {
      novelContributors = yaml.load(fs.readFileSync(folder + "/contributors.yml"));
    } catch (err) {
      console.error(chalk.bold.red(`Can't find contributors.yml for novel ${novel}.`));
    }
    contributors.bulkAddContributors(novel, novelContributors);
  }
}

async function compileChapter(folder, images, id) {
  return new Promise(async (resolve) => {
    const t0 = performance.now();
    const novel = folder.split("novels/")[1];
    let chapters = [];
    let chapterTitles = {};
    let contributions = {};
    const files = await globby(`novels/${novel}/contents/**/*.md`, { onlyFiles: true });

    files.forEach((file) => {
      const matter0 = performance.now();
      const meta = fm(fs.readFileSync(file, "utf-8"));
      const matter1 = performance.now();
      // console.log("reading frontmatter takes", matter1 - matter0, "ms.");
      const index = file.split("chapter-")[1].slice(0, -3);
      chapterTitles[index] = (meta.attributes as any).title || "chapter-" + index;
      chapters.push(file);
      for (const contribution of contributionRoles.get()) {
        const contributor = meta.attributes[contribution];
        if (contributor && revSharePerChapter.get()[contribution]) {
          contributions[contributor] =
            (contributions[contributor] || 0) + revSharePerChapter.get()[contribution];
        }
      }
    });

    const rev_share = Object.keys(contributions).map((contributor) => {
      return `${contributors.get(novel)[contributor]}#${contributions[contributor]}`;
    });

    const chapterList = chapters
      .map((file) => {
        const split = file.split("/");
        return convertToNumeric(split[split.length - 1], false);
      })
      .sort(sortChapters);

    const info = yaml.load(fs.readFileSync(folder + "/info.yml", "utf8"));
    if (!Array.isArray(info.paymentPointers)) {
      info.paymentPointers = [info.paymentPointers];
    }
    const synopsis = md(fs.readFileSync(folder + "/synopsis.md", "utf8"));

    let meta = { id, ...info, synopsis, chapters: chapterList, cover: images, rev_share };
    console.log("Generating", chalk.bold.underline.green(meta.title), "metadata...");
    fs.writeFileSync(folder + "/.publish/metadata.json", JSON.stringify(meta, null, 4));
    fs.writeFileSync(folder + "/.publish/chapter-titles.json", JSON.stringify(chapterTitles));
    const t1 = performance.now();
    console.log(
      "Processing",
      files.length,
      "markdowns for novel",
      novel,
      "in",
      (t1 - t0).toFixed(2),
      "ms.",
    );
    resolve(meta);
  });
}

function sortChapters(a, b) {
  a = convertToNumeric(a);
  b = convertToNumeric(b);

  if (a[0] === b[0]) {
    return a[1] - b[1];
  }

  return a[0] - b[0];
}

function convertToNumeric(chapterName, parse = true) {
  let splitString = chapterName.replace("chapter-", "").replace(".md", "");

  if (parse) {
    if (splitString === "prologue") splitString = 0.1;
    splitString = splitString.split("-");
    if (splitString[1] == 0) splitString[1] = 0.5;
    if (splitString[1] === undefined) splitString[1] = 0;
    if (splitString[1] * 0 !== 0) splitString[1] = 99999; // NaN sub-index will be sorted as non-numeric

    let result;
    try {
      result = splitString.map((ch) => JSON.parse(ch));
    } catch (error) {
      console.log("Error when parsing", splitString[1]);
    }

    return result;
  }
  return splitString;
}
