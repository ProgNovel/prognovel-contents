const chalk = require('chalk')

function workingFolderNotFound() {
  console.log('.')
  console.log('.')
  console.log('-------------------------------------')
  console.log('|  ', chalk.bold.red('Error!'), '                         |')
  console.log('|    ', chalk.underline.bold('working folder not found'), '     |')
  console.log('-------------------------------------')
  console.log('')
  console.log('%cMake sure you put your novels in "books" directory.', '"color: green"')
}


module.exports = {
  workingFolderNotFound
}