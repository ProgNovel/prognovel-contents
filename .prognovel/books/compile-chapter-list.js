const glob = require('glob')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const md = require('marked')
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

async function compileChapter(folder) {
  let chapters = []
  glob(path.resolve(folder, 'contents/**/*.md'), (err, files) => {
    files.forEach(file => {
      chapters.push(file)
      // console.log(file)
    })
    chapters = chapters.sort((a, b) => {

    })

    const metadatafile = fs.readFileSync(folder + '/metadata.json', 'utf-8')
    let meta

    try {
      meta = JSON.parse(metadatafile)
    } catch (err) {
      meta = {}
    }

    const chapterList = chapters.map(file => {
      const split = file.split('/')
      return split[split.length - 1]
    }).sort(sortChapters)

    const info = yaml.safeLoad(fs.readFileSync(folder + '/info.yml', 'utf8'));
    const synopsis = md(fs.readFileSync(folder + '/synopsis.md', 'utf8'))

    meta = { ...info, synopsis, chapters: chapterList }
    fs.writeFileSync(folder + '/metadata.json', JSON.stringify(meta, null, 4))
  })
}

function sortChapters(a, b) {
  a = convertToNumeric(a)
  b = convertToNumeric(b)

  return a - b
}

function convertToNumeric(chapterName) {
  let s = chapterName.replace('chapter-', '').replace('.md', '').replace('-', '.')
  return JSON.parse(s)
}

module.exports = compileChapterList