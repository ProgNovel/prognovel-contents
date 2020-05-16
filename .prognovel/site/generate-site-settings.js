const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')


function generateSiteSettings() {
  const settingsFile = path.resolve(__dirname, '../../site-settings.yml')
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile))

  return settings
}

module.exports = generateSiteSettings