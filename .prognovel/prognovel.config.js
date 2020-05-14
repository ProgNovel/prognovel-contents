const path = require('path')

const BOOK_COVER = {
  sizes: {
    book: [250, 250],
    thumbnail: [187, 187]
  },
  formats: ['webp', 'jpeg']
}

const WORKING_FOLDER = path.resolve(__dirname, '../books')

module.exports = {
  BOOK_COVER,
  WORKING_FOLDER
}