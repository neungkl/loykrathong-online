var express = require('express');
var router = express.Router();
var db = require('../database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.post('/add', function(req, res, next) {
  var sess = req.session;
  if (typeof sess.kid === "undefined") {

    if (typeof req.body.name === "undefined") {
      res.render(JSON.stringify({
        "success": "no",
        "msg": "no name"
      }));
      return;
    } else {
      req.body.name = req.body.name.trim();
      if (req.body.name.length == 0 || req.body.name.length > 50) {
        res.render(JSON.stringify({
          "success": "no",
          "msg": "length incorrect"
        }));
        return;
      }
    }

    var instance = new db.karthongSchema();

    instance.name = req.body.name;
    instace.attack = 0;
    instace.rid = Math.ramdom();
    instance.start = Date.now();
    instance.end = 0;

    var log = new db.logSchema();
    log.message = instance.name + " born.";
    log.timestamp = Date.now();
    log.save();

    instance.save(function(err) {
      if (err) {
        res.render(JSON.stringify({
          "success": "no",
          "msg": "save error"
        }));
      } else {
        res.render('{"success": "yes"}');
      }
    });


  } else {
    res.render(JSON.stringify({
      "success": "no",
      "msg": "duplicate"
    }));
  }
});

rounter.get('/attack', function(req, res, next) {
  var sess = req.session;

  if (typeof sess.attacktime !== "undefined" && Date.now() - sess.attacktime < 200) {
    return res.render(JSON.stringify({
      "success": "no",
      "msg": "flooding"
    }));
  }

  if(typeof req.query.id !== "number") {
    return res.render(JSON.stringify({
      "success": "no",
      "msg": "not a number"
    }));
  }

  db.karthongSchema.findById(req.query.id, function (err, krathong) {
    if (err) {
      return res.sender(JSON.stringify({
        "success": "no",
        "msg": "error"
      }));
    }

    krathong.attack = parseInt(krathong.attack) + 1;
    if(krathong.attack >= 10 && krathong.end === 0) {
      krathong.end = Date.now();

      var log = new db.logSchema();
      log.message = instance.name + " has drown.";
      log.timestamp = Date.now();
      log.save();
    }

    krathong.save(function (err) {
      if (err) return res.sender(JSON.stringify({
        "success": "no",
        "msg": "error"
      }));

      return res.sender(JSON.stringify({
        "success": "yes"
      }));
    });
  });

});

rounter.get('/data', function(req, res, next) {
  var sess = req.session;

  if (typeof sess.fetchtime !== "undefined" && Date.now() - sess.fetchtime < 60000) {
    res.render(JSON.stringify({
      "success": "no",
      "msg": "flooding",
      "data": []
    }));
    return ;
  }

  var rand = Math.random()
  result = db.docs.find({
    rid: {
      $gte: rand
    }
  }).limit(100).lean().exec(function(err, data) {
    if(err || data.length === 0) {

      result = db.docs.find({
        rid: {
          $lte: rand
        }
      }).limit(100).lean().exec(function(err2, datal) {
        if(err2 || datal.length === 0) {
          return res.render(JSON.stringify({
            "success": "no",
            "msg": "err",
            "data": []
          }))
        } else {
          return res.render(JSON.stringify({
            "success": "yes",
            "data": datal
          }));
        }
      });

    } else {
      return res.render(JSON.stringify({
        "success": "yes",
        "data": data
      }));
    }
  });

});

module.exports = router;
