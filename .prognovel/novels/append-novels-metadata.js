const { readFile, writeFile } = require('fs').promises
const path = require('path')

async function appendNovelsMetadata(novelsMetadata) {
  const siteMetadataFile = path.resolve(__dirname, '../../sitemetadata.json')
  const siteMetadata = JSON.parse(await (readFile(
    siteMetadataFile
  )))
  novelsMetadata = novelsMetadata.map(meta => {
    return {
      id: meta.id,
      title: meta.title,
      author: meta.author,
      totalChapter: meta.chapters.length,
      lastChapter: meta.chapters[meta.chapters.length - 1]
    }
  })
  siteMetadata.novelsMetadata = novelsMetadata
  await writeFile(siteMetadataFile, JSON.stringify(siteMetadata, null, 2))
}

module.exports = appendNovelsMetadata