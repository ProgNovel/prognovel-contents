function workingFolderNotFound() {
  console.log('.')
  console.log('.')
  console.log('-------------------------------------')
  console.log('|   Error!                          |')
  console.log('|     working folder not found      |')
  console.log('-------------------------------------')
  console.log('')
  console.log('%cMake sure you put your novels in "books" directory.', '"color: green"')
}


module.exports = {
  workingFolderNotFound
}