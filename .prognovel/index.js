const sharp = require('sharp')
const fs = require('fs')

sharp('cover.jpg')
  .webp({ quality: 50 })
  .toFile('../dist/cover.webp')