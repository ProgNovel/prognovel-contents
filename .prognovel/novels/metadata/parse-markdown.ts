import fs from "fs";
import path from "path";
import * as markdown from "markdown-wasm";
import fm from "front-matter";
import { contributionRoles, revSharePerChapter, contributors } from "../contributors";

interface Cache {
  file: {
    body: string;
    data: any;
    lastModified: DOMHighResTimeStamp;
    contributions: any;
    unregistered: string[];
  };
}

export function parseMarkdown(novel: string, files: string[]) {
  let content = {};
  let chapters = [];
  let chapterTitles = {};
  let contributions = {};
  let unregisteredContributors = [];
  let unchangedFiles = 0;
  let cache: Cache | {};
  const cacheFolder = path.join(process.cwd(), "/.cache");
  const cacheFile = cacheFolder + `/${novel}.json`;
  if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);
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
    unregisteredContributors = [...unregisteredContributors, ...unregistered];
    unregistered = [];
    if (!chapterTitles[book]) chapterTitles[book] = {};
    chapterTitles[book]["chapter-" + index] = (meta.attributes as any).title || "chapter-" + index;
    chapters.push(book + "/chapter-" + index);
    // console.log(share);
    Object.keys(contributors.get(novel)).forEach((contributor) => {
      contributions[contributor] = (contributions[contributor] || 0) + (share[contributor] || 0);
    });
  });

  return {
    content,
    chapters,
    chapterTitles,
    contributions,
    unregisteredContributors,
    unchangedFiles,
    cache,
    cacheFile,
  };
}
