const glob = require('glob')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const md = require('marked')
const { WORKING_FOLDER } = require('../prognovel.config')
const checkValidBookFolder = require('../utils/check-valid-book-folder')
const convertBookCover = require('./generate-cover')
const chalk = require('chalk')

async function generateMetadata(novels) {
  const firstNovel = novels[0]
  console.log(WORKING_FOLDER)
  return await Promise.all(
    glob(path.resolve(WORKING_FOLDER, '*'), (err, folders) => {
      folders.map(folder => {
        return new Promise(
          resolve => {
            let folderName = folder.split('/')
            folderName = folderName[folderName.length - 1]
            if (novels.includes(folderName)) {
              if (checkValidBookFolder(folder)) {
                novels = novels.filter(novel => novel !== folderName)

                // TODO refactor placeholder ratio in prognovel.config.js
                const placeholderRatio = firstNovel === folderName ? 2 : 1
                convertBookCover(folder + '/cover.jpg', placeholderRatio)
                  .then(images => {
                    resolve(compileChapter(folder, images))
                  })
              }
            }

          }
        )
        // foldername can be optimized in one line ...
      })
      if (novels.length) console.log(novels, 'fails to generate.')
    })
  )
}

async function compileChapter(folder, images) {
  return new Promise((resolve, reject) => {
    let chapters = []
    glob(path.resolve(folder, 'contents/**/*.md'), (err, files) => {
      files.forEach(file => {
        chapters.push(file)
      })

      const chapterList = chapters.map(file => {
        const split = file.split('/')
        return convertToNumeric(split[split.length - 1], false)
      }).sort(sortChapters)

      const info = yaml.safeLoad(fs.readFileSync(folder + '/info.yml', 'utf8'));
      const synopsis = md(fs.readFileSync(folder + '/synopsis.md', 'utf8'))

      let meta = { ...info, synopsis, chapters: chapterList, cover: images }
      console.log('Generating', chalk.bold.underline.green(meta.title), 'metadata...')
      fs.writeFileSync(folder + '/.publish/metadata.json', JSON.stringify(meta, null, 4))

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
  let s = chapterName.replace('chapter-', '').replace('.md', '')

  if (parse) {
    if (s === 'prologue') s = 0.1
    s = s.split('-')
    if (s[1] == 0) s[1] = 0.5
    if (s[1] === undefined) s[1] = 0
    if (s[1] * 0 !== 0) s[1] = 99999 // NaN sub-index will be sorted as non-numeric

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