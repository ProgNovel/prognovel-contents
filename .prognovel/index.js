const { generateMetadata, appendNovelsMetadata } = require('./novels/index')
const generateSiteSettings = require('./site/generate-site-settings')

async function init() {
  const settings = generateSiteSettings()
  const novelsMetadata = await generateMetadata(settings.novels)
  await appendNovelsMetadata(novelsMetadata)
}

init()