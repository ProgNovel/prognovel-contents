const sharp = require('sharp')
const path = require('path')
const fs = require('fs')
const base64js = require('base64-js')

const input = path.resolve(__dirname, '../cover.jpg')
const folder = path.resolve(__dirname, '../cover')

if (!fs.existsSync(folder)) fs.mkdirSync(folder)

const qualities = {
  low: 35,
  medium: 55,
  high: 70
}
const sizes = [300, 500]
const formats = ['jpg', 'webp']

const t1 = Date.now()
formats.forEach(format => {
  sizes.forEach(size => {
    for (const key in qualities) {
      if (qualities.hasOwnProperty(key)) {
        const quality = qualities[key];
        const output = path.resolve(__dirname, `../cover/cover-${size}-${key}.${format}`)

        if (format === 'webp') {
          sharp(input)
            .resize(size)
            .webp({ quality, reductionEffort: 6 })
            .toFile(output)
        } else {
          sharp(input)
            .resize(size)
            .jpeg({ quality })
            .toFile(path.resolve(__dirname, `../cover/cover-${size}-${key}.${format}`))
        }
      }
    }
  })
})

sharp(input)
  .resize(50)
  .jpeg({ quality: 25 })
  .toFile(path.resolve((__dirname), '../cover/cover-placeholder.jpg'))

const t2 = Date.now()
console.log('Resizing takes', t2 - t1, 'ms.')

