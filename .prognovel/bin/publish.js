const { cfWorkerKV } = require("../utils/cloudflare-api");
const { readFileSync, existsSync } = require("fs");
const { load } = require("js-yaml");
const { settings } = require("cluster");

exports.command = "publish";
// exports.aliases = ["build", "b"];

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = async function (argv) {
  const post = [];
  const siteSettings = load(readFileSync(getYaml("site-settings.yml"), "utf-8"));
  let novels = [];
  if (siteSettings) {
    novels = siteSettings.novels;
    if (!novels) throw 'site-settings.yml doesn\'t contain "novels" value.';
  } else {
    throw "No site-settings.yml is found.";
  }
  const metadata = readFileSync(".publish/fullmetadata.json", "utf-8");
  post.push(cfWorkerKV().put("metadata", metadata));

  novels.forEach((novel) => {
    const data = readFileSync(`.publish/${novel}/data.txt`, "utf-8");
    post.push(cfWorkerKV().put(`data:${novel}:0`, data));
  });

  await Promise.all(post);
  console.log(
    "🚀 your novels have been updated in datacenters all around the world. This process might takes a minute.",
  );
};

exports.describe = "Push generated content to Cloudflare KV Workers.";

function getYaml(file) {
  if (existsSync(file)) return file;

  const currentExt = file.endsWith("yaml") ? "yaml" : "yml";
  const nextExt = file.endsWith("yaml") ? "yml" : "yaml";
  return file.slice(0, -1 * currentExt.length) + nextExt;
}
