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
    book: {
      jpeg: {},
      webp: {}
    },
    thumbnail: {},
    placeholder: ''
  }

  formats.forEach(format => {
    for (const size in sizes) {
      const loop = size === 'book' ? 3 : 1
      const quality = BOOK_COVER.quality
      const name = (i = 1) => {
        if (i > 1) {
          return `/cover-${size}-${i}x.${format}`
        }
        return `/cover-${size}.${format}`
      }

      if (size !== 'placeholder') {
        if (format === 'webp') {
          for (let i = 1; i <= loop; i++) {
            if (size === 'book') {
              images[size][format][i + 'x'] = name(i)
            } else {
              images[size][format] = name(i)
            }
            sharp(input)
              .resize(sizes[size][0] * i, sizes[size][1] * i)
              .webp({ quality, reductionEffort: 6 })
              .toFile(outputFolder + name(i))
          }
        } else {
          for (let i = 1; i <= loop; i++) {
            if (size === 'book') {
              images[size][format][i + 'x'] = name(i)
            } else {
              images[size][format] = name(i)
            }
            sharp(input)
              .resize(sizes[size][0] * i, sizes[size][1] * i)
              .jpeg({ quality })
              .toFile(outputFolder + name(i))
          }
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


  return images
}

module.exports = convertBookCover