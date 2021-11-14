const { cfWorkerKV } = require("../utils/cloudflare-api");
const { readFileSync, existsSync, createWriteStream, writeFileSync } = require("fs");
const { load } = require("js-yaml");
const { failBuild } = require("../.dist/fail");
const { fail } = require("./_errors");
let main = {};
try {
  main = require("../.dist/main");
} catch (error) {
  // fail();
}
const { pickImage } = main;
const imageType = require("image-type");
const fetch = require("node-fetch");
const FormData = require("form-data");
exports.command = "publish";
// exports.aliases = ["build", "b"];

exports.builder = {
  publish: {
    default: false,
  },
};

const webhook =
  "https://discord.com/api/webhooks/905388052799717376/wiSMZXx-O0g-1sY90WNrmS7am88KnZ2FTSdTnn_vRXUgv7beJ1HVV9PymQOPcfwQ517s";

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

  for await (p of await uploadSiteImages()) {
    post.push(p);
  }

  for (novel of novels) {
    for await (p of await uploadNovelImages(novel)) {
      post.push(p);
    }
  }

  const metadata = readFileSync(".publish/fullmetadata.json", "utf-8");
  post.push(cfWorkerKV().put("metadata", metadata));

  novels.forEach((novel) => {
    const data = readFileSync(`.publish/${novel}/data.txt`, "utf-8");
    post.push(cfWorkerKV().put(`data:${novel}:0`, data));
  });

  post.push(
    new Promise(async (resolve, reject) => {
      try {
        const out = ".publish/components.zip";
        await zipDirectory("components", out);
        await cfWorkerKV().put(`data:components.zip`, readFileSync(out));
        resolve();
      } catch (error) {
        reject(error);
      }
    }),
  );

  try {
    await Promise.all(post);

    console.log(
      "\n🚀 your novels have been updated in datacenters all around the world. This process might takes a minute.\n",
    );

    if (process.env.SITE_URL) {
      const updatedNovels = JSON.parse(readFileSync(".cache/novel-change.json", "utf-8"));

      for (const novel of updatedNovels) {
        console.log("👋 posting announcement for " + novel + " updates.");
        postToDiscord(webhook, novel);
      }
    }
  } catch (error) {}
};

exports.describe = "Push generated content to Cloudflare KV Workers.";

async function uploadSiteImages() {
  const post = [];
  const allowedImageExt = "{png,jpeg,webp,jpg,bmp}";
  const siteImages = {
    logo: await pickImage("logo." + allowedImageExt),
    favicon: await pickImage("favicon." + allowedImageExt),
  };

  Object.keys(siteImages).forEach((image) => {
    if (!siteImages[image])
      failBuild(
        `Make sure you have the required images in your project folder.
        Required filename is ${image}.${allowedImageExt}`,
        `image for ${image} not found`,
      );
    const buffer = readFileSync(siteImages[image]);
    post.push(cfWorkerKV().put(`image:${image}`, buffer));
  });

  return post;
}

async function uploadNovelImages(novel) {
  const post = [];
  const allowedImageExt = "{png,jpeg,webp,jpg,bmp}";
  const novelImages = {
    banner: await pickImage(`novels/${novel}/banner.${allowedImageExt}`),
    cover: await pickImage(`novels/${novel}/cover.${allowedImageExt}`),
  };

  Object.keys(novelImages).forEach((image) => {
    if (!novelImages[image])
      failBuild(
        `Make sure you have the required images in your novel folder.
  Required filename is novel/${novel}/${image}.${allowedImageExt}`,
        `image for ${image} not found`,
      );

    const buffer = readFileSync(novelImages[image]);

    post.push(cfWorkerKV().put(`image:${novel}:${image}`, buffer));
  });

  return post;
}

function getYaml(file) {
  if (existsSync(file)) return file;

  const currentExt = file.endsWith("yaml") ? "yaml" : "yml";
  const nextExt = file.endsWith("yaml") ? "yml" : "yaml";
  return file.slice(0, -1 * currentExt.length) + nextExt;
}

async function postToDiscord(discordWebhookURL, novel) {
  const discordColors = [
    0, 1752220, 1146986, 3066993, 2067276, 3447003, 2123412, 10181046, 15277667, 11342935, 15844367, 12745742,
    15105570, 11027200, 15158332, 10038562, 9807270, 9936031, 8359053, 12370112, 3426654, 2899536, 16776960,
    16777215, 5793266, 10070709, 2895667, 2303786, 5763719, 16705372, 15418782, 15548997, 16777215, 2303786,
  ];
  let siteURL = process.env.SITE_URL;
  if (siteURL.slice(-1) === "/") siteURL = siteURL.slice(0, -1);
  const siteMetadata = JSON.parse(readFileSync(".publish/fullmetadata.json"));
  let text = ``;
  const novelMetadata = siteMetadata.novelsMetadata.find((meta) => meta.id === novel);
  const embeds = [
    {
      // author: {
      //   name: novelMetadata.title,
      //   url: "https://demo.prognovel.com/novel/yashura-legacy",
      //   icon_url: '"https://demo.prognovel.com/publish/yashura-legacy/cover-64x64.png"',
      // },
      title: novelMetadata.title + " updates",
      description: `New chapters have been published. Check it out!\n\n${siteURL}/novel/${novel}`,
      url: siteURL + `/novel/${novel}`,
      image: {
        url: siteURL + `/publish/${novel}/cover-128.jpeg`,
        height: 128,
        width: 128,
      },
      color: discordColors[Math.floor(Math.random() * discordColors.length)],
    },
  ];
  const post = await fetch(discordWebhookURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: text,
      embeds,
    }),
  });
  if (post.status < 300) {
    const updatedNovels = JSON.parse(readFileSync(".cache/novel-change.json", "utf-8"));
    writeFileSync(
      ".cache/novel-change.json",
      JSON.stringify(updatedNovels.filter((s) => novel !== s)),
      "utf-8",
    );
  }
}

const archiver = require("archiver");

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}
