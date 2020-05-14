const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const { WORKING_FOLDER } = require('../prognovel.config')


const folder = WORKING_FOLDER
const sizes = [250, Math.floor(250 * 0.75)]
const formats = ['jpeg', 'webp']

function generateCover() {
  const t1 = Date.now()
  console.log('Searching', folder)

  if (!fs.existsSync(folder)) return workingFolderNotFound()

  glob(path.resolve(folder, '**/cover.jpg'), (err, files) => {
    files.forEach(file => {
      console.log(file, 'is found.')
      convertBookCover(file)
    })
  })


  const t2 = Date.now()
  console.log('Resizing takes', t2 - t1, 'ms.')
}

function convertBookCover(input) {
  const outputFolder = path.resolve(input, '../cover')
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
function workingFolderNotFound() {
  console.log('.')
  console.log('.')
  console.log('-------------------------------------')
  console.log('|   Error!                          |')
  console.log('|     working folder not found      |')
  console.log('-------------------------------------')
  console.log('')
  console.log('%cMake sure you put your novels in "Books" directory.', '"color: green"')
}

module.exports = generateCover