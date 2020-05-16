const fs = require('fs')
const chalk = require('chalk')

function checkValidBookFolder(folder) {
  const isInfoExist = fs.existsSync(folder + '/info.yml')
  const isSynopsisExist = fs.existsSync(folder + '/synopsis.md')

  if (!isInfoExist) console.error(chalk.bold.red(`info.yml doesn\'t exist at ${folder}`))
  if (!isSynopsisExist) console.error(chalk.bold.red(`synopsis.md doesn\'t exist at ${folder}`))

  return isInfoExist && isSynopsisExist
}

module.exports = checkValidBookFolder