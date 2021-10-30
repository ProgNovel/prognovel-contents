// import "./.prognovel/utils/fallback";
import { generateMetadata, appendNovelsMetadata } from "./novels/index";
import { generateSiteSettings } from "./site/generate-site-settings";
import { host } from "./hosting";
import { check } from "./check";
import { fixTypo } from "./fix-typo";
import { failBuild } from "./utils/build";
import { pickImage } from "./utils/image";
import { novelFiles, publishFiles, siteFiles } from "./_files";

async function init(opts?: any) {
  console.log("Initialize on folder:", process.cwd());
}

async function addNovel(opts?: any) {}

async function build(opts?: any) {
  console.log("");
  console.log(" 🚀 Starting ProgNovel...");
  try {
    const settings = generateSiteSettings();
    const novelsMetadata = await generateMetadata(settings.novels);
    const cleanMetadata = novelsMetadata.filter((novel) => JSON.stringify(novel) !== "{}");
    appendNovelsMetadata(cleanMetadata);
  } catch (err) {
    failBuild([err], "unexpected error!", { label: "crash" });
  }
}

export {
  init,
  pickImage,
  build,
  addNovel,
  host,
  check,
  fixTypo,
  failBuild,
  siteFiles,
  novelFiles,
  publishFiles,
};

// init();
