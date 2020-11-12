import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import fm from "front-matter";
import { matter } from "wasm-frontmatter";
import chalk from "chalk";
import md from "marked";
import globby from "globby";
import glob from "tiny-glob";
import { performance } from "perf_hooks";
import { checkValidBookFolder } from "../utils/check-valid-book-folder";
import { generateBookCover } from "./generate-cover";
import { convertToNumeric, sortChapters } from "../utils/sort";
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
    const novel = folder.split("novels/")[1];
    let chapters = [];
    let chapterTitles = {};
    let contributions = {};

    const t0 = performance.now();
    const glob0 = performance.now();
    const files = await globby(`novels/${novel}/contents/**/*.md`);
    const glob1 = performance.now();
    const cacheFolder = path.resolve(__dirname, "../.cache");
    const cacheFile = cacheFolder + `/${novel}.json`;
    if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);
    let cache;
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8")) || {};
    } catch (err) {
      cache = {};
    }

    files.forEach((file) => {
      let meta;
      let lastModified = fs.statSync(file).mtime.getTime();
      const index = file.split("chapter-")[1].slice(0, -3);
      const book = file.split("contents/")[1].split("/chapter")[0];
      const cacheLastModified = cache[file]?.lastModified || 0;
      if (lastModified > cacheLastModified) {
        cache[file] = {};
        meta = fm(fs.readFileSync(file, "utf-8"));

        console.log("book:", book);
        for (const contribution of contributionRoles.get()) {
          const contributor = meta.attributes[contribution];
          if (contributor && revSharePerChapter.get()[contribution]) {
            contributions[contributor] =
              (contributions[contributor] || 0) + revSharePerChapter.get()[contribution];
          }
        }
        cache[file]["contributions"] = contributions;
        cache[file].lastModified = lastModified;
        cache[file].chapters = chapters;
        cache[file].data = meta.attributes;
      } else {
        // console.log("Get from cache for", file);
        contributions = cache[file]["contributions"];
        (meta ? meta : (meta = {})).attributes = cache[file].data;
        // contributors.bulkAddContributors(novel, cache[file]["contributors"]);
      }
      chapterTitles[index] = (meta.attributes as any).title || "chapter-" + index;
      chapters.push(book + "/" + index);
    });
    // console.log(cache);
    const rev0 = performance.now();
    const rev_share = Object.keys(contributions).map((contributor) => {
      return `${contributors.get(novel)[contributor]}#${contributions[contributor]}`;
    });
    const rev1 = performance.now();
    const ch0 = performance.now();
    const chapterList = chapters.sort(sortChapters);
    const ch1 = performance.now();

    const info = yaml.load(fs.readFileSync(folder + "/info.yml", "utf8"));
    if (!Array.isArray(info.paymentPointers)) {
      info.paymentPointers = [info.paymentPointers];
    }
    const synopsis = md(fs.readFileSync(folder + "/synopsis.md", "utf8"));

    let meta = { id, ...info, synopsis, chapters: chapterList, cover: images, rev_share };

    console.log("");
    console.log("Generating", chalk.bold.underline.green(meta.title), "metadata...");
    const logTitle = chalk.bold.greenBright("[" + meta.title + "]:");
    console.log(logTitle, "Iterating globby takes", (glob1 - glob0).toFixed(2), "ms");
    console.log(logTitle, "Sorting chapter takes", (ch1 - ch0).toFixed(2), "ms");
    console.log(logTitle, "Calculating rev share takes", (rev1 - rev0).toFixed(2), "ms");
    console.log(
      logTitle,
      Object.keys(contributors)?.length === 1
        ? "person contributes"
        : Object.keys(contributors)?.length,
      "people contribute",
      "over",
      files.length,
      "chapters.",
    );

    fs.writeFileSync(folder + "/.publish/metadata.json", JSON.stringify(meta, null, 4));
    fs.writeFileSync(folder + "/.publish/chapter-titles.json", JSON.stringify(chapterTitles));
    fs.writeFileSync(cacheFile, JSON.stringify(cache || {}), "utf-8");
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
