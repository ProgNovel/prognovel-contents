const { generateMetadata } = require('./novels/index')
const generateSiteSettings = require('./site/generate-site-settings')

const settings = generateSiteSettings()
// generateBookCover(settings.novels)
generateMetadata(settings.novels)