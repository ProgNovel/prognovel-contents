import fs from "fs";
import path from "path";
import * as markdown from "markdown-wasm";
import fm from "front-matter";
import { contributionRoles, revSharePerChapter, contributors } from "../contributors";
import { cacheFiles } from "../../_files";

interface Cache {
  file: {
    body: string;
    data: any;
    lastModified: DOMHighResTimeStamp;
    contributions: any;
    unregistered: string[];
  };
}

type ChapterTitles = object;

export function parseMarkdown(novel: string, files: string[]): parsingMarkdownResult {
  let content = {};
  let chapters = [];
  let chapterTitles: ChapterTitles = {};
  let contributions = {};
  let unregisteredContributors = [];
  let unchangedFiles = 0;
  let cache: Cache;
  let folder = cacheFiles();
  if (!fs.existsSync(folder.folder)) fs.mkdirSync(folder.folder);
  try {
    cache = JSON.parse(fs.readFileSync(folder.novelCompileCache(novel), "utf-8")) || {};
  } catch (err) {
    // @ts-ignore
    cache = {};
  }
  files.forEach((file) => {
    let meta;
    let lastModified = fs.statSync(file).mtime.getTime();
    const index = file.split("chapter-")[1].slice(0, -3);
    const book = file.split("contents\\")[1].split("\\chapter")[0];
    const name = `${book}/chapter-${index}`;
    const cacheLastModified = cache?.[file]?.lastModified || 0;
    let share = {};
    let unregistered = [];
    if (lastModified > cacheLastModified) {
      cache[file] = {};
      meta = fm(fs.readFileSync(file, "utf-8"));
      content[name] = markdown.parse(meta.body);

      for (const contribution of contributionRoles.get()) {
        const workers = meta.attributes[contribution];
        if (workers && revSharePerChapter.get()[contribution]) {
          workers
            .split(",")
            .filter((name: string) => !!name)
            .forEach((contributor: string) => {
              contributor = contributor.trim();
              if (Object.keys(contributors.get(novel)).includes(contributor)) {
                share[contributor] = (share[contributor] || 0) + revSharePerChapter.get()[contribution];
              } else {
                unregistered.push({ contributor, where: `${book}/chapter-${index}` });
              }
            });
        }
      }

      cache[file].contributions = share;
      cache[file].lastModified = lastModified;
      cache[file].data = meta.attributes;
      cache[file].body = content[name];
      cache[file].unregistered = unregistered;
    } else {
      // console.log("Get from cache for", file);
      share = cache[file].contributions;
      unregistered = cache[file].unregistered;
      content[name] = cache[file].body;
      (meta ? meta : (meta = {})).attributes = cache[file].data;
      ++unchangedFiles;
      // contributors.bulkAddContributors(novel, cache[file]["contributors"]);
    }

    // wrapping up
    unregisteredContributors = [...unregisteredContributors, ...unregistered];
    unregistered = [];

    if (!chapterTitles?.[book]) chapterTitles[book] = {};
    chapterTitles[book]["chapter-" + index] = (meta.attributes as any).title || "chapter-" + index;
    chapters.push(book + "/chapter-" + index);

    for (const contributor in contributors.get(novel)) {
      contributions[contributor] = (contributions[contributor] || 0) + (share[contributor] || 0);
    }
  });

  return {
    content,
    chapters,
    chapterTitles,
    contributions,
    unregisteredContributors,
    unchangedFiles,
    cache,
  };
}

interface parsingMarkdownResult {
  content: any;
  chapters: string[];
  chapterTitles: object;
  contributions: object;
  unregisteredContributors: string[];
  unchangedFiles: number;
  cache: Cache;
}
