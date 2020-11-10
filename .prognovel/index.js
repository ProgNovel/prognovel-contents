const { generateMetadata, appendNovelsMetadata } = require('./novels/index')
const generateSiteSettings = require('./site/generate-site-settings')

async function init() {
  const settings = generateSiteSettings()
  const novelsMetadata = await generateMetadata(settings.novels)
  const cleanMetadata = novelsMetadata.reduce((prev, cur) => {
    if (JSON.stringify(cur) !== '{}') return [...prev, cur]
    return prev
  }, [])
  await appendNovelsMetadata(cleanMetadata)
}

init()