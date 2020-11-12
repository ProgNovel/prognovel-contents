import { readFileSync, writeFileSync } from "fs";
import path from "path";

export async function appendNovelsMetadata(novelsMetadata) {
  const siteMetadataFile = path.resolve(__dirname, "../../sitemetadata.json");
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
}
