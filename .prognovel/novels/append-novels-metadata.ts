import { readFileSync, writeFileSync } from "fs";
import { publishFiles } from "../_files";

export function appendNovelsMetadata(novelsMetadata) {
  const siteMetadataFile = publishFiles().siteMetadata;
  try {
    const siteMetadata = JSON.parse(readFileSync(siteMetadataFile, "utf-8"));
    novelsMetadata = novelsMetadata.map((meta) => {
      return {
        id: meta.id,
        title: meta.title,
        author: meta.author,
        totalChapter: meta.chapters.length,
        lastChapter: meta.chapters[meta.chapters.length - 1],
      };
    });
    siteMetadata.novelsMetadata = novelsMetadata;
    writeFileSync(siteMetadataFile, JSON.stringify(siteMetadata, null, 2));
  } catch (err) {
    console.error("Error when reading site metadata.");
    console.error(err);
  }
}
