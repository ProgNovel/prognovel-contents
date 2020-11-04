const glob = require('glob-promise')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const fm = require('front-matter')
const md = require('marked')
const { WORKING_FOLDER } = require('../prognovel.config')
const checkValidBookFolder = require('../utils/check-valid-book-folder')
const convertBookCover = require('./generate-cover')
const chalk = require('chalk')

async function generateMetadata(novels) {
  const firstNovel = novels[0]
  console.log(WORKING_FOLDER)
  const folders = await glob(WORKING_FOLDER + '/*')
  return Promise.all(folders.map(async folder => {
    let folderName = folder.split('/')
    folderName = folderName[folderName.length - 1]
    if (novels.includes(folderName)) {
      if (checkValidBookFolder(folder)) {
        novels = novels.filter(novel => novel !== folderName)

        // TODO refactor placeholder ratio in prognovel.config.js
        const placeholderRatio = firstNovel === folderName ? 2 : 1
        const images = await convertBookCover(folder + '/cover.jpg', placeholderRatio)
        return await compileChapter(folder, images, folderName)
      }
    }
    return {}
  }))
  if (novels.length) console.log(novels, 'fails to generate.')
}

async function compileChapter(folder, images, id) {
  return new Promise((resolve, reject) => {
    let chapters = []
    let chapterTitles = {}
    glob(path.resolve(folder, 'contents/**/*.md'), (err, files) => {
      files.forEach(file => {
        const meta = fm(fs.readFileSync(file, 'utf-8'))
        const index = file.split('chapter-')[1].slice(0, -3);
        chapterTitles[index] = meta.attributes.title || 'chapter-' + index
        chapters.push(file)
      })

      const chapterList = chapters.map(file => {
        const split = file.split('/')
        return convertToNumeric(split[split.length - 1], false)
      }).sort(sortChapters)

      const info = yaml.safeLoad(fs.readFileSync(folder + '/info.yml', 'utf8'));
      if (!Array.isArray(info.paymentPointers)) {
        info.paymentPointers = [info.paymentPointers]
      }
      const synopsis = md(fs.readFileSync(folder + '/synopsis.md', 'utf8'))

      let meta = { id, ...info, synopsis, chapters: chapterList, cover: images }
      console.log('Generating', chalk.bold.underline.green(meta.title), 'metadata...')
      fs.writeFileSync(folder + '/.publish/metadata.json', JSON.stringify(meta, null, 4))
      fs.writeFileSync(folder + '/.publish/chapter-titles.json', JSON.stringify(chapterTitles))

      if (err) {
        console.error(err)
        reject(err)
      }

      resolve(meta)
    })
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
  let splitString = chapterName.replace('chapter-', '').replace('.md', '')

  if (parse) {
    if (splitString === 'prologue') splitString = 0.1
    splitString = splitString.split('-')
    if (splitString[1] == 0) splitString[1] = 0.5
    if (splitString[1] === undefined) splitString[1] = 0
    if (splitString[1] * 0 !== 0) splitString[1] = 99999 // NaN sub-index will be sorted as non-numeric

    let result
    try {
      result = splitString.map(ch => JSON.parse(ch))
    } catch (error) {
      console.log('Error when parsing', splitString[1])
    }

    return result
  }
  return splitString
}

module.exports = generateMetadata