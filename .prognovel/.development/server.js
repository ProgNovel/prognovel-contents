const polka = require('polka');
const { getNovelMetadata, getSiteMetadata, getChapterData, addMeter, getNovelChapterTitles } = require('./utils');
const { getImage } = require('./image')

const PORT = 4000

function cors(res, req, next) {
  next()
}

polka()
  .use(cors)
  .get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(getSiteMetadata());
  })
  .get('/novel', (req, res) => {
    const {
      name, titles_only
    } = req.query;
    try {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (!!titles_only) {
        res.end(getNovelChapterTitles(name))
      } else {
        res.end(getNovelMetadata(name));
      }
    } catch (err) {
      console.log(err);
      res.end('Novel not found.');
    }
  })
  .get('/chapter', (req, res) => {
    let { novel, name, book } = req.query;
    addMeter(req.query);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      res.end(getChapterData(novel, name, book))
    } catch (err) {
      res.writeHead(404, {
        'Content-Type': 'application/json',
        'X-Error-Code': 'Chapter not found.'
      });
      res.end(JSON.stringify({
        error: 'Chapter not found',
        status: 404
      }, null, 2))
    }
  })
  .get('/image', (req, res) => {
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    getImage('http://localhost' + req.url).pipe(res)
  })
  .listen(PORT, err => {
    if (err) throw err;
    console.log(`> Running on localhost: ${PORT}`);
  });