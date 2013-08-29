var express = require ("express"),
    fs = require("fs"),
    formidable = require("formidable"),
    im = require("imagemagick"),
    crypto = require("crypto");

var app = express(),
    iplog = {};

app.configure(function(){
  app.use(express.static(__dirname + '/resources'));
});

app.post('/upload', function(req, res) {
  console.log("Request handler 'upload' was called.");
  ip = req.ip;
  var currenttime = new Date().getTime();
  if (iplog[ip] && currenttime - iplog[ip] < 20000) {
      res.send("Sie haben bereits vor " + (currenttime - iplog[ip])/1000 + " Sekunden ein Bild erstellt. Sie können nicht mehr als 1 Bild pro 20 Sekunden erstellen.");
  } else {
    iplog[ip] = new Date().getTime();
  
    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(req, function(error, fields, files) {
      console.log("parsing done");
      var text = fields.text;
      var shasum = crypto.createHash('sha1');
      shasum.update(text, 'utf8');
      var filename = shasum.digest('hex');

      im.convert(['-background', 'none', '-gravity', 'center', '-font', 'fonts/PraterBlockOne-Regular.otf', '-fill', 'black', '-size', '242x146', 'caption:' + text, 'resources/pictures/Vorlage.jpg', '+swap', '-gravity', 'north', '-geometry', '+18+220', '-composite', 'resources/pictures/all/' + filename + '.jpg'], function(err) {
        if (err) throw err;
        else {
          console.log('image conversion successfull');
        }

        res.writeHead(200, {"Content-Type": "text/html"});
        res.write("<img src='/pictures/all/" + filename + ".jpg' />");
        res.end();

      })


    });
    }
});


app.get('/', function(req, res) {
  console.log("Request handler 'start' was called.");
    fs.readFile('./upload.html', 'utf8', function(err, data) {
      if (err) console.log(err);
    
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(data);
      res.end();
    });
});

app.listen(5555);
console.log('Listening on port 5555');

