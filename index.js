require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// BASE DE DADOS
const urls = {};
let idCounter = 1;

// ROTA POST
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  
  // 1. Verificar formato básico com URL Object
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
    // FCC exige protocolo http ou https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.json({ error: 'invalid url' });
    }
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // 2. Verificar DNS
  // DICA: O dns.lookup às vezes falha no localhost dependendo do sistema.
  // Vamos usar o 'hostname' que extraímos em cima.
  dns.lookup(parsedUrl.hostname, (err) => {
    // Se der erro, retornamos json de erro
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Se passar:
    const shortUrl = idCounter;
    urls[shortUrl] = originalUrl;
    idCounter++;
    
    res.json({ 
      original_url: originalUrl, 
      short_url: shortUrl 
    });
  });
});

// ROTA GET
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urls[shortUrl];

  if (originalUrl) {
    // 301 ou 302 funcionam, mas o redirect simples é mais seguro para testes
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});