const glob = require('glob')
const path = require('path')
const fs = require('fs')
const { WORKING_FOLDER } = require('../prognovel.config')

function compileChapterList() {
  glob(path.resolve(WORKING_FOLDER, '*'), (err, folders) => {
    folders.forEach(folder => {
      if (fs.existsSync(folder + '/metadata.json')) {
        console.log(folder, 'is found.')
        compileChapter(folder)
      }
    })
  })
}

function compileChapter() {

}

module.exports = compileChapterList