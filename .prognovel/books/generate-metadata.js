const glob = require('glob')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const md = require('marked')
const { WORKING_FOLDER } = require('../prognovel.config')
const checkValidBookFolder = require('../utils/check-valid-book-folder')

function generateMetadata() {
  glob(path.resolve(WORKING_FOLDER, '*'), (err, folders) => {
    folders.forEach(folder => {
      if (checkValidBookFolder(folder)) {
        compileChapter(folder)
      }
    })
  })
}

async function compileChapter(folder) {
  let chapters = []
  glob(path.resolve(folder, 'contents/**/*.md'), (err, files) => {
    files.forEach(file => {
      chapters.push(file)
    })

    let meta = {}

    const chapterList = chapters.map(file => {
      const split = file.split('/')
      return convertToNumeric(split[split.length - 1], false)
    }).sort(sortChapters)

    const info = yaml.safeLoad(fs.readFileSync(folder + '/info.yml', 'utf8'));
    const synopsis = md(fs.readFileSync(folder + '/synopsis.md', 'utf8'))

    meta = { ...info, synopsis, chapters: chapterList }
    fs.writeFileSync(folder + '/.publish/metadata.json', JSON.stringify(meta, null, 4))
  })
}

function sortChapters(a, b) {
  a = convertToNumeric(a)
  b = convertToNumeric(b)

  return a - b
}

function convertToNumeric(chapterName, parse = true) {
  let s = chapterName.replace('chapter-', '').replace('.md', '')

  if (parse) {
    if (s === 'prologue') s = 0
    return JSON.parse(s.replace('-', '.'))
  }

  return s
}

module.exports = generateMetadata