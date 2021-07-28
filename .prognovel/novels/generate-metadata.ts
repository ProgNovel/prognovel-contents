import fs from "fs";
import yaml from "js-yaml";
import chalk from "chalk";
import md from "marked";
import glob from "tiny-glob";
import { performance } from "perf_hooks";
import { checkValidBookFolder, ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";
import { generateBookCover } from "./generate-cover";
import sort from "alphanum-sort";
import { parseMarkdown } from "./metadata/parse-markdown";
import { contributors, calculateContributors, contributionRoles } from "./contributors";
import brotli from "brotli";
import { outputMessage, benchmark } from "./metadata/logging";
import { cacheFiles, novelFiles, publishFiles } from "../_files";
import { lstatSync } from "fs";

export async function generateMetadata(novels: string[]) {
  const firstNovel = novels[0];

  const folders = (await glob("novels/*")).filter(folder => lstatSync(folder).isDirectory());
  // console.log("Detecting folders:", folders);
  return Promise.all(
    folders.map(async (folder) => {
      // folder name is the same as novel id
      let folderName: string[] | string = folder.split("/");
      folderName = folderName[folderName.length - 1];
      if (novels.includes(folderName)) {
        if (checkValidBookFolder(folderName)) {
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
      novelContributors = yaml.load(fs.readFileSync(novelFiles(novel).contributorsConfig));
    } catch (err) {
      console.error(chalk.bold.red(`Can't find contributors.yml for novel ${novel}.`));
    }
    contributors.bulkAddContributors(novel, novelContributors);
  }
}

async function compileChapter(folder: string, images, novel: string) {
  return new Promise(async (resolve) => {
    const t0 = performance.now();

    benchmark.glob.start = performance.now();
    const files = await (
      await glob(`novels/${novel}/contents/**/*.md`, { filesOnly: true })
    ).map((path: string) => path.replace(/\\/g, "/"));
    benchmark.glob.end = performance.now();

    benchmark.markdown.start = performance.now();
    contributionRoles.setAssignedRolesForNovel(novel)
    let { content, chapters, chapterTitles, contributions, unregisteredContributors, unchangedFiles, cache } =
      await parseMarkdown(novel, files, { hash: false });
    benchmark.markdown.end = performance.now();
    // console.log(cache);

    benchmark.rev_share.start = performance.now();
    const rev_share = calculateContributors(novel, contributions);
    benchmark.rev_share.end = performance.now();

    benchmark.sorting_chapters.start = performance.now();
    const chapterList = sort(chapters);
    benchmark.sorting_chapters.end = performance.now();

    benchmark.filesystem.start = performance.now();
    const info = yaml.load(fs.readFileSync(novelFiles(novel).info, "utf8"));
    info.genre = info.genre
      .split(",")
      .filter((s: string) => !!s)
      .map((s: string) => s.trim());
    if (info.tags)
      info.tags = info.tags
        .split(",")
        .filter((s: string) => !!s)
        .map((s: string) => s.trim());
    const synopsis = md(fs.readFileSync(novelFiles(novel).synopsis, "utf8"));

    let meta = { id: novel, ...info, synopsis, chapters: chapterList, cover: images, rev_share };

    ensurePublishDirectoryExist(novel);
    generateFiles({ novel, meta, chapterTitles, content, cache });
    benchmark.filesystem.end = performance.now();

    const t1 = performance.now();
    outputMessage({
      id: novel,
      title: meta.title,
      files,
      unchangedFiles,
      contributors,
      totalDuration: (t1 - t0).toFixed(2),
      unregisteredContributors,
    });

    resolve(meta);
  });
}

function generateFiles({ novel, meta, chapterTitles, content, cache }) {
  const data = {
    metadata: JSON.stringify(meta),
    chapterTitles: JSON.stringify(chapterTitles),
    content: JSON.stringify(content),
  };
  const bin = { metadata: meta, chapterTitles, content };
  fs.writeFileSync(publishFiles().novelMetadata(novel), JSON.stringify(meta, null, 4));
  fs.writeFileSync(publishFiles().novelChapterTitles(novel), JSON.stringify(chapterTitles));
  fs.writeFileSync(cacheFiles().novelCompileCache(novel), JSON.stringify(cache || {}), "utf-8");
  fs.writeFileSync(publishFiles().novelCompiledContent(novel), JSON.stringify(content));
  fs.writeFileSync(publishFiles().novelBinary(novel), JSON.stringify(bin));
}
