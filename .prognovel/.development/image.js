const sharp = require("sharp");
const { statSync, createReadStream, ReadStream } = require("fs");
const { resolve } = require("path");

function getImageStats(novel) {
  const raw = resolve(__dirname, `../../novels/${novel}/banner.jpeg`);
  return statSync(raw, { bigint: false });
}

function getRawImage(novel) {
  const raw = resolve(__dirname, `../../novels/${novel}/banner.jpeg`);
  return createReadStream(raw);
  // return readFileSync
}

function getImage(route, webp = true) {
  const url = new URL(route);
  let width = parseInt(url.searchParams.get("width"));
  let height = parseInt(url.searchParams.get("height"));
  const novel = route.split("/novels/")[1].split("/banner")[0];
  const image = getRawImage(novel);

  const resizeOpts = { withoutEnlargement: true };

  const transform = webp
    ? sharp().resize(width, height, resizeOpts).webp()
    : sharp().resize(width, height, resizeOpts).jpeg({ quality: 75 });

  return image.pipe(transform);
}

module.exports = {
  getImage,
};
