function cleanHTML(str) {
  return str
    .replace(/"/gm, `\"`) // prettier-ignore
    .replace(/\n/gm, '')
    .replace(/--/gm, '&mdash;');
}

module.exports = {
  cleanHTML
}