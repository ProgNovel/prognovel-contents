const path = require('path')

const BOOK_COVER = {
  sizes: {
    book: [250, 250],
    thumbnail: [187, 187],
    placeholder: [50, 50]
  },
  formats: ['webp', 'jpeg'],
  quality: 80
}

const WORKING_FOLDER = path.resolve(__dirname, '../novels')

module.exports = {
  BOOK_COVER,
  WORKING_FOLDER
}