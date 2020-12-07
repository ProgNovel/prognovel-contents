import fs from "fs";
import path from "path";
import * as markdown from "markdown-wasm";
import fm from "front-matter";
import { createHashFromFile } from "../../utils/hash-file";
import { contributionRoles, revSharePerChapter, contributors } from "../contributors";
import { cacheFiles, novelFiles, siteFiles } from "../../_files";
import { performance } from "perf_hooks";
import yaml from "js-yaml";
import type { RevenueShare, ChapterTitles, FrontMatter, UnregisterContributor } from "../types";

interface Options {
  hash?: boolean;
}

interface Cache {
  [novel: string]: CacheValue;
}

interface CacheValue {
  body: string;
  data: any;
  lastModified: DOMHighResTimeStamp;
  contributions: any;
  unregistered: UnregisterContributor[];
  hash?: string;
}

const emptyCache: CacheValue = {
  body: "",
  data: {},
  lastModified: 0,
  contributions: {},
  unregistered: [],
};

const emptyFrontMatter: FrontMatter = {
  attributes: {
    title: "",
    ...Object.keys(
      yaml.safeLoad(fs.readFileSync(siteFiles().settings, "utf-8")).rev_share_contribution_per_chapter,
    ).reduce((prev, cur) => {
      prev[cur] = {};
      return prev;
    }, {}),
  },
  body: "",
};

export async function parseMarkdown(
  novel: string,
  files: string[],
  opts?: Options,
): Promise<parsingMarkdownResult> {
  let content = {};
  let chapters: Array<string> = [];
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

  for await (const file of files) {
    let frontmatter: FrontMatter;
    let lastModified = fs.statSync(file).mtime.getTime();
    const index = file.split("chapter-")[1].slice(0, -3);
    const book = file.split("contents\\")[1].split("\\chapter")[0];
    const name = `${book}/chapter-${index}`;
    const cacheLastModified = cache?.[file]?.lastModified || 0;
    let calculatedRevenueShare: RevenueShare = {};
    let unregistered: UnregisterContributor[] = [];
    let hash: string;

    if (typeof cache[file] === "undefined") cache[file] = Object.create(emptyCache);
    if (opts?.hash) hash = await createHashFromFile(file);
    const hasChanged = opts?.hash ? hash !== cache[file].hash : lastModified > cacheLastModified;

    if (hasChanged) {
      if (opts?.hash) cache[file].hash = hash;
      frontmatter = fm(fs.readFileSync(file, "utf-8"));
      content[name] = markdown.parse(frontmatter.body);

      for (const contribution of contributionRoles.get()) {
        const workers = frontmatter.attributes[contribution];
        if (workers && revSharePerChapter.get()[contribution]) {
          workers
            .split(",")
            .map((name: string) => name.trim())
            .filter((name: string) => !!name)
            .forEach((contributor: string) => {
              if (Object.keys(contributors.get(novel)).includes(contributor)) {
                calculatedRevenueShare[contributor] =
                  (calculatedRevenueShare[contributor] || 0) + revSharePerChapter.get()[contribution];
              } else {
                unregistered.push({ contributor, where: `${book}/chapter-${index}` });
              }
            });
        }
      }

      cache[file].contributions = calculatedRevenueShare;
      cache[file].lastModified = lastModified;
      cache[file].data = frontmatter.attributes;
      cache[file].body = content[name];
      cache[file].unregistered = unregistered;
    } else {
      // console.log("Get from cache for", file);
      calculatedRevenueShare = cache[file].contributions;
      unregistered = cache[file].unregistered;
      content[name] = cache[file].body;
      if (typeof frontmatter === "undefined") frontmatter = Object.create(emptyFrontMatter);
      frontmatter.attributes = cache[file].data;
      ++unchangedFiles;
      // contributors.bulkAddContributors(novel, cache[file]["contributors"]);
    }

    // wrapping up
    unregisteredContributors = [...unregisteredContributors, ...unregistered];
    unregistered = [];

    if (!chapterTitles?.[book]) chapterTitles[book] = {};
    chapterTitles[book]["chapter-" + index] = (frontmatter.attributes as any).title || "chapter-" + index;
    chapters.push(book + "/chapter-" + index);

    for (const contributor in contributors.get(novel)) {
      contributions[contributor] =
        (contributions[contributor] || 0) + (calculatedRevenueShare[contributor] || 0);
    }
  }

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
