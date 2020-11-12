// import "./.prognovel/utils/fallback";
import { generateMetadata, appendNovelsMetadata } from "./.prognovel/novels/index";
import { generateSiteSettings } from "./.prognovel/site/generate-site-settings";

async function init() {
  console.log("Starting ProgNovel");
  const settings = generateSiteSettings();
  const novelsMetadata = await generateMetadata(settings.novels);
  const cleanMetadata = novelsMetadata.reduce((prev: any[], cur) => {
    if (JSON.stringify(cur) !== "{}") return [...prev, cur];
    return prev;
  }, []);
  await appendNovelsMetadata(cleanMetadata);
}

init();
