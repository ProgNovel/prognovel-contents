import sharp from "sharp";
import path from "path";
import fs from "fs";
import { NOVEL_FOLDER, BOOK_COVER } from "../prognovel.config";
import { workingFolderNotFound } from "../utils/_errors";
import { ensurePublishDirectoryExist } from "../utils/check-valid-book-folder";

const sizes = BOOK_COVER.sizes;
const formats = BOOK_COVER.formats;
const inputType = "jpg";

export async function generateBookCover(novel: string, placeholderRatio = 1) {
  // checking in publish folder
  let novelPublishFolder = path.join(process.cwd(), "/.publish/" + novel);
  ensurePublishDirectoryExist(novel);
  let outputFolder = path.join(novelPublishFolder, "/cover");
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

  // checking input image
  let inputImage = path.join(process.cwd(), `novels/${novel}/cover.png`);
  if (!fs.existsSync(inputImage)) inputImage = path.join(process.cwd(), `novels/${novel}/cover.jpg`);
  if (!fs.existsSync(inputImage)) inputImage = path.join(process.cwd(), `novels/${novel}/cover.jpeg`);
  if (!fs.existsSync(inputImage))
    throw `Error: cover image for novel ${novel} not found; make sure an image with name cover (png or jpg) exists in novel folder.`;

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
              .toFile(outputFolder + name(i));
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
              .toFile(outputFolder + name(i));
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
