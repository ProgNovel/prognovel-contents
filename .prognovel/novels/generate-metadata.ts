import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import fm from "front-matter";
import chalk from "chalk";
import md from "marked";
import globby from "globby";
import glob from "tiny-glob";
import { performance } from "perf_hooks";
import { checkValidBookFolder, ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";
import { generateBookCover } from "./generate-cover";
import { convertToNumeric, sortChapters } from "../utils/sort";
import {
  contributionRoles,
  revSharePerChapter,
  contributors,
  calculateContributors,
  warnUnregisteredContributors,
} from "./contributors";
import * as markdown from "markdown-wasm";
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

interface Cache {
  file: {
    body: string;
    data: any;
    lastModified: DOMHighResTimeStamp;
    contributions: any;
    unregistered: string[];
  };
}

async function compileChapter(folder: string, images, id: string) {
  return new Promise(async (resolve) => {
    const novel = folder.split("novels/")[1];
    let content = {};
    let chapters = [];
    let chapterTitles = {};
    let contributions = {};
    let unregisteredContributor = [];
    let unchangedFiles = 0;

    // // @ts-ignore
    // await markdown.ready;

    const t0 = performance.now();
    const glob0 = performance.now();
    const files = await globby(`novels/${novel}/contents/**/*.md`);
    const glob1 = performance.now();
    const cacheFolder = path.join(process.cwd(), "/.cache");
    const cacheFile = cacheFolder + `/${novel}.json`;
    if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);
    let cache: Cache | {};
    try {
      cache = JSON.parse(fs.readFileSync(cacheFile, "utf-8")) || {};
    } catch (err) {
      cache = {};
    }

    const md0 = performance.now();
    files.forEach((file) => {
      let meta;
      let lastModified = fs.statSync(file).mtime.getTime();
      const index = file.split("chapter-")[1].slice(0, -3);
      const book = file.split("contents/")[1].split("/chapter")[0];
      const name = `${book}/chapter-${index}`;
      const cacheLastModified = cache[file]?.lastModified || 0;
      let share = {};
      let unregistered = [];
      if (lastModified > cacheLastModified) {
        cache[file] = {};
        meta = fm(fs.readFileSync(file, "utf-8"));
        content[name] = markdown.parse(meta.body);

        for (const contribution of contributionRoles.get()) {
          const workers = meta.attributes[contribution];
          if (workers && revSharePerChapter.get()[contribution]) {
            workers.split(",").forEach((contributor: string) => {
              contributor = contributor.trim();
              if (Object.keys(contributors.get(novel)).includes(contributor)) {
                share[contributor] = (share[contributor] || 0) + revSharePerChapter.get()[contribution];
              } else {
                unregistered.push({ contributor, where: `${book}/chapter-${index}` });
              }
            });
          }
        }

        cache[file]["contributions"] = share;
        cache[file].lastModified = lastModified;
        cache[file].data = meta.attributes;
        cache[file].body = content[name];
        cache[file]["unregistered"] = unregistered;
      } else {
        // console.log("Get from cache for", file);
        share = cache[file]["contributions"];
        unregistered = cache[file]["unregistered"];
        content[name] = cache[file].body;
        (meta ? meta : (meta = {})).attributes = cache[file].data;
        ++unchangedFiles;
        // contributors.bulkAddContributors(novel, cache[file]["contributors"]);
      }
      unregisteredContributor = [...unregisteredContributor, ...unregistered];
      unregistered = [];
      if (!chapterTitles[book]) chapterTitles[book] = {};
      chapterTitles[book]["chapter-" + index] = (meta.attributes as any).title || "chapter-" + index;
      chapters.push(book + "/chapter-" + index);
      // console.log(share);
      Object.keys(contributors.get(novel)).forEach((contributor) => {
        contributions[contributor] = (contributions[contributor] || 0) + (share[contributor] || 0);
      });
    });
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

    let meta = { id, ...info, synopsis, chapters: chapterList, cover: images, rev_share };

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
    fs.writeFileSync(
      publishFolder + "/content.json.br",
      brotli.compress(Buffer.from(JSON.stringify(content), "utf-8"), { quality: 9 }),
    );
    fs.writeFileSync(cacheFile, JSON.stringify(cache || {}), "utf-8");
    const t1 = performance.now();
    console.log("Processing", novel, "in", (t1 - t0).toFixed(2), "ms.");
    warnUnregisteredContributors(unregisteredContributor);
    resolve(meta);
  });
}
