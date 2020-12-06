import sharp from "sharp";
import fs from "fs";
import { join } from "path";
import { publishFiles, novelFiles } from "../_files";
import { BOOK_COVER } from "../prognovel.config";
import { ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";

const sizes = BOOK_COVER.sizes;
const formats = BOOK_COVER.formats;
const inputType = "jpg";

export async function generateBookCover(novel: string, placeholderRatio = 1) {
  const folder = publishFiles();
  ensurePublishDirectoryExist(novel);
  if (!fs.existsSync(folder.novelCoverFolder(novel))) fs.mkdirSync(folder.novelCoverFolder(novel));

  // checking input image
  let inputImage = novelFiles(novel).cover;

  // metadata
  const images = {
    book: {
      jpeg: {},
      webp: {},
    },
    thumbnail: {},
    placeholder: "",
  };

  formats.forEach((format) => {
    for (const size in sizes) {
      const loop = size === "book" ? 3 : 1;
      const quality = BOOK_COVER.quality;
      const name = (i = 1) => {
        if (i > 1) {
          return `/cover-${size}-${i}x.${format}`;
        }
        return `/cover-${size}.${format}`;
      };

      if (size !== "placeholder") {
        if (format === "webp") {
          for (let i = 1; i <= loop; i++) {
            if (size === "book") {
              images[size][format][i + "x"] = name(i);
            } else {
              images[size][format] = name(i);
            }
            sharp(inputImage)
              .resize(sizes[size][0] * i, sizes[size][1] * i)
              .webp({ quality, reductionEffort: 6 })
              .toFile(join(folder.novelCoverFolder(novel), name(i)));
          }
        } else {
          for (let i = 1; i <= loop; i++) {
            if (size === "book") {
              images[size][format][i + "x"] = name(i);
            } else {
              images[size][format] = name(i);
            }
            sharp(inputImage)
              .resize(sizes[size][0] * i, sizes[size][1] * i)
              .jpeg({ quality })
              .toFile(join(folder.novelCoverFolder(novel), name(i)));
          }
        }
      }
    }
  });
  const placeholderSizes = sizes.placeholder.map((size) => size * 2);
  const buffer = await sharp(inputImage)
    .resize(placeholderSizes[0], placeholderSizes[1])
    .jpeg({ quality: 25 })
    .toBuffer();
  images.placeholder = "data:image/jpeg;base64," + buffer.toString("base64");

  return images;
}
