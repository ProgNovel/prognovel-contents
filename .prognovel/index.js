const { generateMetadata } = require('./novels/index')
const generateSiteSettings = require('./site/generate-site-settings')

async function init() {
  const settings = generateSiteSettings()
  const novelsMetadata = await generateMetadata(settings.novels)
  console.log('DONE!')
  console.log('Novels metadata are', novelsMetadata)
}

init()