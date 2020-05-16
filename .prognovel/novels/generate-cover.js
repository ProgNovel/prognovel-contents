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

async function convertBookCover(input, placeholderRatio = 1) {
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
      const quality = BOOK_COVER.quality
      const name = `/cover-${size}.${format}`
      const output = outputFolder + name

      images[size][format] = name

      if (size !== 'placeholder') {
        if (format === 'webp') {
          sharp(input)
            .resize(sizes[size][0], sizes[size][1])
            .webp({ quality, reductionEffort: 6 })
            .toFile(output)
        } else {
          sharp(input)
            .resize(sizes[size][0], sizes[size][1])
            .jpeg({ quality })
            .toFile(output)
        }
      }
    }
  })
  const placeholderSizes = sizes.placeholder.map(size => size * 2)
  const buffer = await sharp(input)
    .resize(placeholderSizes[0], placeholderSizes[1])
    .jpeg({ quality: 25 })
    .toBuffer()
  images.placeholder = 'data:image/jpeg;base64,' + buffer.toString('base64')

  console.log(images)

  return images
}

module.exports = convertBookCover