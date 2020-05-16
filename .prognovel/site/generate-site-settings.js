const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const { WORKING_FOLDER } = require('../prognovel.config')


function generateSiteSettings() {
  const settingsFile = path.resolve(__dirname, '../../site-settings.yml')
  const settings = yaml.safeLoad(fs.readFileSync(settingsFile))

  if (!settings.cors) settings.cors = '*'
  fs.writeFileSync(
    path.resolve(WORKING_FOLDER, '../sitemetadata.json'),
    JSON.stringify(settings, null, 4)
  )

  return settings
}

module.exports = generateSiteSettings