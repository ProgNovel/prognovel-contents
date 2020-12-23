import { readFileSync, writeFileSync } from "fs";
import { publishFiles } from "../_files";

export function appendNovelsMetadata(novelsMetadata) {
  try {
    const siteMetadata = JSON.parse(readFileSync(publishFiles().siteMetadata, "utf-8"));
    const shortMetadata = novelsMetadata.map((meta) => {
      return {
        id: meta.id,
        title: meta.title,
        author: meta.author,
        totalChapter: meta.chapters.length,
        lastChapter: meta.chapters[meta.chapters.length - 1],
      };
    });
    siteMetadata.novelsMetadata = shortMetadata;
    writeFileSync(publishFiles().siteMetadata, JSON.stringify(siteMetadata, null, 2));
    siteMetadata.fullMetadata = novelsMetadata.reduce((prev, cur) => {
      prev[cur.id] = cur;
      return prev;
    }, {});
    writeFileSync(publishFiles().fullMetadata, JSON.stringify(siteMetadata, null, 2));
  } catch (err) {
    console.error("Error when reading site metadata.");
    console.error(err);
  }
}
