require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let idCounter = 1;
let urls = {};

app.post('/api/shorturl', function(req, res){
  const originalUrl = req.body.url;
  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) =>{
    if (err){
      res.json({ error: 'invalid url'});
    } else {
      const shortUrl = idCounter;
      urls[shortUrl] = originalUrl;
      idCounter++; 
      res.json({ original_url: originalUrl, short_url: shortUrl});
    }
  });
});

app.get('/api/shorturl/:short_url', function(req, res){
  const shortUrl = parseInt(req.params.short_url);

  const originalUrl = urls[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
