const { cfWorkerKV } = require("../utils/cloudflare-api");
const { readFileSync, existsSync } = require("fs");
const { load } = require("js-yaml");
const { settings } = require("cluster");
const { failBuild } = require("../.dist/fail");
const { fail } = require("./_errors");

exports.command = "publish";
// exports.aliases = ["build", "b"];

exports.builder = {
  publish: {
    default: false,
  },
};

exports.handler = async function (argv) {
  const post = [];
  let siteSettings;
  try {
    siteSettings = load(readFileSync(getYaml("site-settings.yml"), "utf-8"));
  } catch (error) {
    fail();
  }
  let novels = [];
  if (siteSettings) {
    novels = siteSettings.novels;
    if (!novels)
      failBuild(
        `Make sure you set value for "novels" variable in 
  site-settings.yml (that located in your project\'s root folder)
  with an array of strings for your novels' IDs. Novel IDs don't contain spaces
  and must be the same as their novel folders in your project.
  
  [Example in site-settings.yml]

  novels:
    - my-new-novel
    - my-other-novel
  
  ^ before dash each novel ID value, make sure each tab contain 2 spaces length.  `,
        'site-settings.yml doesn\'t contain "novels" value',
      );
  } else {
    failBuild(
      `Make sure you have site-settings.yml in your root project folder.
    And make sure only to run ProgNovel CLI in your root project folder.
    
    If you haven't create your project already, create an empty folder and run "prognovel new [your-project-title]" there`,
      "no site-settings.yml is found",
    );
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
