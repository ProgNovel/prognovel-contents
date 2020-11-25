import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import chalk from "chalk";
import md from "marked";
import globby from "globby";
import glob from "tiny-glob";
import { performance } from "perf_hooks";
import { checkValidBookFolder, ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";
import { generateBookCover } from "./generate-cover";
import { convertToNumeric, sortChapters } from "../utils/sort";
import { parseMarkdown } from "./metadata/parse-markdown";
import { contributors, calculateContributors, warnUnregisteredContributors } from "./contributors";
import brotli from "brotli";

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
          const images = await generateBookCover(folderName, placeholderRatio);
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

async function compileChapter(folder: string, images, novel: string) {
  return new Promise(async (resolve) => {
    const t0 = performance.now();

    const glob0 = performance.now();
    const files = await globby(`novels/${novel}/contents/**/*.md`);
    const glob1 = performance.now();

    const md0 = performance.now();
    let {
      content,
      chapters,
      chapterTitles,
      contributions,
      unregisteredContributors,
      unchangedFiles,
      cache,
      cacheFile,
    } = parseMarkdown(novel, files);
    const md1 = performance.now();
    // console.log(cache);

    const rev0 = performance.now();
    const rev_share = calculateContributors(novel, contributions);

    const rev1 = performance.now();
    const ch0 = performance.now();
    const chapterList = chapters.sort(sortChapters);
    const ch1 = performance.now();

    const info = yaml.load(fs.readFileSync(folder + "/info.yml", "utf8"));
    if (!Array.isArray(info.paymentPointers)) {
      info.paymentPointers = [info.paymentPointers];
    }
    const synopsis = md(fs.readFileSync(folder + "/synopsis.md", "utf8"));

    let meta = { id: novel, ...info, synopsis, chapters: chapterList, cover: images, rev_share };

    console.log("");
    console.log("Generating", chalk.bold.underline.green(meta.title), "metadata...");
    const logTitle = chalk.bold.greenBright("[" + meta.title + "]:");
    console.log(logTitle, "Iterating globby takes", (glob1 - glob0).toFixed(2), "ms");
    console.log(logTitle, "Sorting chapter takes", (ch1 - ch0).toFixed(2), "ms");
    console.log(logTitle, "Calculating rev share takes", (rev1 - rev0).toFixed(2), "ms");
    console.log(
      logTitle,
      `Processing ${files.length} markdowns${
        unchangedFiles ? ` (${files.length - unchangedFiles} changed)` : ""
      } take`,
      (rev1 - rev0).toFixed(2),
      "ms",
    );
    console.log(
      logTitle,
      Object.keys(contributors)?.length === 1 ? "person contributes" : Object.keys(contributors)?.length,
      "people contribute",
      "over",
      files.length,
      "chapters.",
    );

    ensurePublishDirectoryExist(novel);
    const publishFolder = path.join(process.cwd(), `/.publish/${novel}`);
    fs.writeFileSync(publishFolder + "/metadata.json", JSON.stringify(meta, null, 4));
    fs.writeFileSync(publishFolder + "/chapter-titles.json", JSON.stringify(chapterTitles));
    fs.writeFileSync(publishFolder + "/content.json", JSON.stringify(content));
    fs.writeFileSync(cacheFile, JSON.stringify(cache || {}), "utf-8");
    const t1 = performance.now();
    console.log("Processing", novel, "in", (t1 - t0).toFixed(2), "ms.");
    warnUnregisteredContributors(unregisteredContributors);
    resolve(meta);
  });
}
