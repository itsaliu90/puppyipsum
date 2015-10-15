var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var path = require('path');
var gm = require('gm')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET a puppy image */
router.get('/:width/:height', function(req, res, next) {
  var width = req.params.width
  var height = req.params.height
  var timestamp = (new Date()).getTime();

  function getPuppyJPGLink() {
      request('http://www.thepuppyapi.com/puppy', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body)
        console.log(body.puppy_url)
        var extension = body.puppy_url.slice(-3)
        console.log("EXTENSION IS: ", extension)
        if (extension == "jpg") {
          console.log("FINISHED!")
          var requestStream = request(body.puppy_url).on('error', function(err) {console.log(err)}).pipe(fs.createWriteStream('./public/images/' + timestamp + '.jpg')).on('error', function(err) {console.log('error')})
          requestStream.on('finish', function() {

            gm(path.join(__dirname, '../public/images', timestamp + '.jpg'))
            .resizeExact(width, height)
            .write(path.join(__dirname, '../public/images', timestamp + '.jpg'), function (err) {
              if (!err) console.log('done');

                res.sendFile(path.join(__dirname, '../public/images', timestamp + '.jpg'), function(err) {
                  if (err) {
                    console.log("ERROR IS: ", err);
                  }
                  else {
                    console.log('Sent!');
                    fs.unlink(path.join(__dirname, '../public/images', timestamp + '.jpg'))
                  }
                })

            });
          })
        } else {
          console.log("LOOPING AGAIN")
          getPuppyJPGLink();
        }

      }
    })
  }

  getPuppyJPGLink();
});

module.exports = router;
