const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { WORKING_FOLDER } = require('../prognovel.config')
const { workingFolderNotFound } = require('../utils/_errors')


const folder = WORKING_FOLDER
const sizes = [250, Math.floor(250 * 0.75)]
const formats = ['jpeg', 'webp']
const inputType = 'jpg'

function generateCover(novels) {
  if (!fs.existsSync(folder)) return workingFolderNotFound()

  glob(path.resolve(folder, `**/cover.${inputType}`), (err, files) => {
    files.forEach(file => {
      convertBookCover(file)
    })
  })
}

function convertBookCover(input) {
  let outputFolder = path.resolve(input, '../.publish')
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder)
  outputFolder = outputFolder + '/cover'
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder)

  formats.forEach(format => {
    sizes.forEach(size => {
      const quality = 70
      const output = outputFolder + `/cover-${size}.${format}`

      if (format === 'webp') {
        sharp(input)
          .resize(size)
          .webp({ quality, reductionEffort: 6 })
          .toFile(output)
      } else {
        sharp(input)
          .resize(size)
          .jpeg({ quality })
          .toFile(output)
      }
    })
  })

  sharp(input)
    .resize(50)
    .jpeg({ quality: 25 })
    .toFile(outputFolder + '/cover-placeholder.jpeg')

}

/** Errors */

module.exports = generateCover