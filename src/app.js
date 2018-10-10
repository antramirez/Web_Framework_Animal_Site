// app.js

// require modules and create app
const webby = require('./webby.js');
const path = require('path');
const app = new webby.App();

// add middleware
app.use(webby.static(path.join(__dirname, '..', 'public')));

// css page
app.get('/css/styles.css');

// homepage
app.get('/', function(req, res) {
 // set appropriate status and send back a response if route matches
 res.status(200).send('<head><title>DOGS</title><link rel="stylesheet" type="text/css" href="/css/styles.css"></head><body><h1>DOGGOS</h1><h3><a href="/gallery">SHOW ME THE POOCHIES</a></h3></body>');
});

// web page that contains dog images
app.get('/gallery', function(req, res) {
  // get random number between 1 and 4 for number of images to display
  const r = Math.floor(Math.random() * 4 + 1);
  // all possible images
  const allImgs = ['animal1', 'animal2', 'animal3', 'animal4'];
  // images string to display
  let imgs = '';

  // loop through images to display
  for (let i = 0; i < r; i++) {
    // get random number between 0 and 3 for index and add image to images string
    const rIndex = Math.floor(Math.random() * r);
    imgs += '<img src="/img/' + allImgs[rIndex] + '.jpg">';
  }
  // set appropriate status and send body
  res.status(200).send('<head><title>DAWGS</title><link rel="stylesheet" type="text/css" href="/css/styles.css"></head><body><h1>Look At All These Cuties</h1><div>' + imgs + '</div></body>');
});

// web page that redirects
app.get('/pics', function(req, res) {
  // set status to 301 and redirect to gallery page
  res.status(301).set('Location', '/gallery');
  // send nothing but res.send will call sock.end()
  res.send('');
});

// individual images (no callback function required - just images being served)
app.get('/img/animal1.jpg');
app.get('/img/animal2.jpg');
app.get('/img/animal3.jpg');
app.get('/img/animal4.jpg');

// listen for connection on localhost
app.listen(3000, '127.0.0.1');
