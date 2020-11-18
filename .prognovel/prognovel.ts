// import "./.prognovel/utils/fallback";
import { generateMetadata, appendNovelsMetadata } from "./novels/index";
import { generateSiteSettings } from "./site/generate-site-settings";
import { host } from "./hosting";
import { check } from "./check";

async function init(cwd: string, opts?: any) {
  console.log("Initialize on folder:", process.cwd());
}

async function addNovel(cwd: string, opts?: any) {
  console.log("Test:", cwd);
}

async function build(cwd: string, opts?: any) {
  console.log("Starting ProgNovel");
  const settings = generateSiteSettings();
  const novelsMetadata = await generateMetadata(settings.novels);
  const cleanMetadata = novelsMetadata.filter((novel) => JSON.stringify(novel) !== "{}");
  appendNovelsMetadata(cleanMetadata);
}

export { init, build, addNovel, host, check };

// init();
