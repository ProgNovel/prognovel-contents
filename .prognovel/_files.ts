import { existsSync } from "fs";
import { join } from "path";
import { errorImageNotFound } from "./utils/build";

export const publishFiles = function (): PublishFiles {
  const folder = join(process.cwd(), "/.publish");
  return {
    folder: folder,
    siteMetadata: join(folder, "sitemetadata.json"),
    novelFolder: (id: NovelID) => join(folder, id),
    novelMetadata: (id: NovelID) => join(folder, id, `metadata.json`),
    novelChapterTitles: (id: NovelID) => join(folder, id, "chapter-titles.json"),
    novelCompiledContent: (id: NovelID) => join(folder, id, "content.json"),
    novelCoverFolder: (id: NovelID) => join(folder, id, "cover"),
    novelCover: (id: NovelID, type: NovelImageCoverType, ext: NovelImageType, size?) => {
      return join(folder, id, "cover", `cover-${type}${size ? "-" + size : ""}.${ext}`);
    },
  };
};

export const siteFiles = function (): SiteFiles {
  return {
    settings: getYaml(join(process.cwd(), "site-settings.yml")),
  };
};

export const cacheFiles = function (): CacheFiles {
  const folder = join(process.cwd(), "/.cache");
  return {
    folder: folder,
    siteMetadata: join(folder, "sitemetadata.json"),
    typoCache: join(folder, "contributors-typo.json"),
    novelCompileCache: (id: NovelID) => join(folder, `${id}.json`),
  };
};

export const novelFiles = function (id: NovelID): NovelFiles {
  const folder = join(process.cwd(), "novels", id);
  return {
    metadata: join(folder, "metadata.json"),
    contentFolder: join(folder, "contents"),
    banner: getNovelImagePath(id, "banner"),
    cover: getNovelImagePath(id, "cover"),
    synopsis: join(folder, "synopsis.md"),
    info: getYaml(join(folder, "info.yml")),
    contributorsConfig: getYaml(join(folder, "contributors.yml")),
  };

  function getNovelImagePath(novel: NovelID, image: NovelImageType, ext = "") {
    if (!ext) ext = imageExt[0];
    const file = join(folder, `${image}.${ext}`);

    if (file && existsSync(file)) return file;

    if (imageExt.indexOf(ext) === imageExt.length - 1) errorImageNotFound(novel, image);
    ext = imageExt[imageExt.indexOf(ext) + 1];
    return getNovelImagePath(novel, image, ext);
  }
};

export const imageExt = ["jpg", "jpeg", "png", "webp"];
export declare type NovelID = string;
export type NovelImageType = "banner" | "cover" | "UserProfile";
export type NovelImageCoverType = "book" | "thumbnail";

function getYaml(file: string) {
  if (existsSync(file)) return file;

  const currentExt = file.endsWith("yaml") ? "yaml" : "yml";
  const nextExt = file.endsWith("yaml") ? "yml" : "yaml";
  return file.slice(0, -1 * currentExt.length) + nextExt;
}

interface SiteFiles {
  settings: string;
}

interface PublishFiles {
  folder: string;
  siteMetadata: string;
  novelFolder: (novel: NovelID) => string;
  novelMetadata: (novel: NovelID) => string;
  novelChapterTitles: (novel: NovelID) => string;
  novelCompiledContent: (novel: NovelID) => string;
  novelCoverFolder: (novel: NovelID) => string;
  novelCover: (
    novel: NovelID,
    type: NovelImageCoverType,
    ext: NovelImageType,
    size?: "" | "2x" | "3x",
  ) => string;
}

interface CacheFiles {
  folder: string;
  siteMetadata: string;
  typoCache: string;
  novelCompileCache: (novel: NovelID) => string;
}

interface NovelFiles {
  metadata: string;
  contentFolder: string;
  banner: string;
  cover: string;
  synopsis: string;
  info: string;
  contributorsConfig: string;
}
