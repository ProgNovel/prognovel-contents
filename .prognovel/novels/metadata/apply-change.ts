import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function applyNovelChanges(novel: string, files: string[], unchangedFiles: number): void {
  const hasChanged = unchangedFiles < files.length;
  const cacheFile = join(".cache", "novel-change.json");
  let changeCache;

  if (!hasChanged) return;

  if (!existsSync(".cache")) mkdirSync(".cache");
  try {
    changeCache = JSON.parse(readFileSync(cacheFile, "utf-8"));
  } catch (error) {
    changeCache = [];
  }
  changeCache = [...new Set([...changeCache, novel])];
  writeFileSync(cacheFile, JSON.stringify(changeCache), "utf-8");
}
