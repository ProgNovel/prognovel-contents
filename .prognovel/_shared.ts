import { existsSync } from "fs";
import { resolve, join } from "path";

const imageExt = ["jpg", "jpeg", "png", "webp"];

declare type NovelID = string;

type cacheFiles = {
  folder: string;
  siteMetadata: string;
  typoCache: string;
  novelMetadata: (novel: NovelID) => string;
};

export const files = {
  cache: function (): cacheFiles {
    const cacheFolder = join(process.cwd(), "/.cache");
    return {
      folder: cacheFolder,
      siteMetadata: join(cacheFolder, "sitemetadata.json"),
      typoCache: join(cacheFolder, "contributors-typo.json"),
      novelMetadata: (id: NovelID) => join(cacheFolder, `${id}.json`),
    };
  },
  novel: (id: NovelID) => {
    return {
      metadata: join(process.cwd(), "novels", id, "metadata.json"),
      contentFolder: join(process.cwd(), "novels", id, "contents"),
      banner: getImagePath(id, "banner"),
      cover: getImagePath(id, "cover"),
    };
  },
};

type NovelImageType = "banner" | "cover" | "UserProfile";

function getImagePath(novel: NovelID, image: NovelImageType, ext = "") {
  if (!ext) ext = imageExt[0];
  const file = join(process.cwd(), "novels", novel, `${image}.${ext}`);

  if (file && existsSync(file)) return file;

  if (imageExt.indexOf(ext) === imageExt.length - 1) throw new Error("No banner found for novel " + novel);
  ext = imageExt[imageExt.indexOf(ext) + 1];
  return getImagePath(novel, image, ext);
}
