const { resolve } = require('path');
const { readFileSync } = require('fs');
const { cleanHTML } = require('./string')
const fm = require('front-matter');
const md = require('marked');

function getSiteMetadata() {
  return readFileSync(
    resolve(__dirname, '../../sitemetadata.json')
  )
}

function getNovelPath(novel) {
  return resolve(__dirname, '../../novels/' + novel)
}

function getNovelMetadata(novel) {
  return readFileSync(
    getNovelPath(novel) + '/.publish/metadata.json'
  )
}

function getChapterData(novel, name, book) {
  let markup;
  try {
    markup = readFileSync(
      resolve(
        __dirname,
        `../../novels/${novel}/contents/${book}/${name}.md`
      )
    ).toString();
  } catch (err) {
    console.log(err)
    return {
      title: 'Error 404',
      html: `<p>Chapter for novel ${novel} volume/book ${volume} chapter ${name} doesn't exist.`,
      status: 404
    }
  }

  const frontmatter = fm(markup);
  const content = md(frontmatter.body);
  return JSON.stringify({
    //@ts-ignore
    title: frontmatter.attributes.title || '',
    html: cleanHTML(content),
    status: 200,
  }, null, 2);
}

const meter = new Map()
function addMeter(index) {
  index = JSON.stringify(index)
  if (!meter[index]) {
    meter[index] = 1
  } else {
    meter[index]++
  }
  console.log(`hitting slug ${index}: ${meter[index]}`)
}

module.exports = {
  getNovelPath,
  getNovelMetadata,
  getSiteMetadata,
  getChapterData,
  addMeter
}