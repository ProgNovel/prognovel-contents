const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { WORKING_FOLDER, BOOK_COVER } = require('../prognovel.config')
const { workingFolderNotFound } = require('../utils/_errors')


const folder = WORKING_FOLDER
const sizes = BOOK_COVER.sizes
const formats = BOOK_COVER.formats
const inputType = 'jpg'

async function convertBookCover(input) {
  let outputFolder = path.resolve(input, '../.publish')
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder)
  outputFolder = outputFolder + '/cover'
  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder)

  const images = {
    book: {},
    thumbnail: {},
    placeholder: ''
  }

  formats.forEach(format => {
    for (const size in sizes) {
      const quality = 70
      const name = `/cover-${size}.${format}`
      const output = outputFolder + name

      images[size][format] = name

      if (format === 'webp') {
        sharp(input)
          .resize(sizes[size])
          .webp({ quality, reductionEffort: 6 })
          .toFile(output)
      } else {
        sharp(input)
          .resize(sizes[size])
          .jpeg({ quality })
          .toFile(output)
      }
    }
  })

  const buffer = await sharp(input)
    .resize(50)
    .jpeg({ quality: 25 })
    .toBuffer()
  images.placeholder = 'data:image/jpeg;base64,' + buffer.toString('base64')

  console.log(images)

  return images
}

module.exports = convertBookCover