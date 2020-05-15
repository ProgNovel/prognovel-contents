const glob = require('glob')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const md = require('marked')
const { WORKING_FOLDER } = require('../prognovel.config')
const checkValidBookFolder = require('../utils/check-valid-book-folder')
const chalk = require('chalk')

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
    console.log('Generating', chalk.bold.underline.green(meta.title), 'metadata...')
    fs.writeFileSync(folder + '/.publish/metadata.json', JSON.stringify(meta, null, 4))
  })
}

function sortChapters(a, b) {
  a = convertToNumeric(a)
  b = convertToNumeric(b)

  if (a[0] === b[0]) {
    return a[1] - b[1]
  }

  return a[0] - b[0]
}

function convertToNumeric(chapterName, parse = true) {
  let s = chapterName.replace('chapter-', '').replace('.md', '')

  if (parse) {
    if (s === 'prologue') s = 0.1
    s = s.split('-')
    if (s[1] == 0) s[1] = 0.5
    if (s[1] === undefined) s[1] = 0
    if (s[1] * 0 !== 0) s[1] = 9999

    let result
    try {
      result = s.map(ch => JSON.parse(ch))
    } catch (error) {
      console.log('Error when parsing', s[1])
    }

    return result
  }
  return s
}

module.exports = generateMetadata