const fs = require('fs')

function checkValidBookFolder(folder) {
  const isInfoExist = fs.existsSync(folder + '/info.yml')
  const isSynopsisExist = fs.existsSync(folder + '/synopsis.md')

  if (!isInfoExist) throw `info.yml doesn\'t exist at ${folder}`
  if (!isSynopsisExist) throw `synopsis.md doesn\'t exist at ${folder}`

  return isInfoExist && isSynopsisExist
}

module.exports = checkValidBookFolder