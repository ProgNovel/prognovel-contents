const { resolve } = require("path");
const { readFileSync } = require("fs");
const { cleanHTML } = require("./string");
const fm = require("front-matter");
const md = require("marked");

const data = {
  "yashura-legacy": JSON.parse(
    readFileSync(resolve(__dirname, `../../.publish/yashura-legacy/data.txt`), "utf-8"),
  ),
};

function getSiteMetadata() {
  return readFileSync(resolve(__dirname, "../../sitemetadata.json"));
}

function getNovelPath(novel) {
  return resolve(__dirname, "../../novels/" + novel);
}

function getNovelMetadata(novel) {
  return data[novel].metadata;
}

function getNovelChapterTitles(novel) {
  return data[novel].chapterTitles;
}

function getChapterData(novel, fetch) {
  return fetch.reduce((prev, cur) => {
    prev[cur] = JSON.parse(JSON.stringify(data[novel].content[cur]));
    prev[cur].html = prev[cur].body;
    delete prev[cur].body;
    return prev;
  }, {});
}

const meter = new Map();
function addMeter(index) {
  index = JSON.stringify(index);
  if (!meter[index]) {
    meter[index] = 1;
  } else {
    meter[index]++;
  }
  console.log(`hitting slug ${index}: ${meter[index]}`);
}

module.exports = {
  getNovelPath,
  getNovelMetadata,
  getNovelChapterTitles,
  getSiteMetadata,
  getChapterData,
  addMeter,
};
