var express = require('express');
var router = express.Router();
var db = require('../database');

/* GET home page. */

var LIFE = 20;

router.post('/add', function(req, res, next) {
  var sess = req.session;

  if (sess.die == false && typeof sess.kid === "string") {
    return res.end(JSON.stringify({
      'success': 'no',
      'msg': 'already created'
    }));
  } else {

    if (typeof req.body.name === 'undefined') {
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'no name'
      }));
    } else {
      req.body.name = req.body.name.trim();
      if (req.body.name.length == 0 || req.body.name.length > 50) {
        return res.end(JSON.stringify({
          'success': 'no',
          'msg': 'length incorrect'
        }));
      }
    }

    var instance = new db.Krathong();

    instance.name = req.body.name;
    instance.attack = 0;
    instance.rid = Math.floor(Math.random() * 1000000000);
    instance.start = Date.now();
    instance.end = 0;

    var log = new db.Log();
    log.message = req.body.name + ' born.';
    log.timestamp = Date.now();
    log.save();

    req.session.die = false;
    req.session.save();

    instance.save(function(err, ins) {
      if (err) {
        res.end(JSON.stringify({
          'success': 'no',
          'msg': 'save error'
        }));
      } else {
        req.session.kid = ins._id;
        req.session.save();

        console.log(ins._id);

        return res.end(JSON.stringify({
          'success': 'yes',
          'id': ins._id
        }));
      }
    });

  }
});

router.post('/attack', function(req, res, next) {
  var sess = req.session;

  if (sess.die == true) {
    return res.end(JSON.stringify({
      'success': 'no',
      'msg': 'you\'re die'
    }));
  }

  if (typeof sess.attacktime !== 'undefined' && Date.now() - sess.attacktime < 300) {
    sess.attacktime = Date.now();
    sess.save();
    return res.end(JSON.stringify({
      'success': 'no',
      'msg': 'flooding'
    }));
  }

  if(typeof req.body.id !== 'string') {
    return res.end(JSON.stringify({
      'success': 'no',
      'msg': 'not a string'
    }));
  }

  if(sess.kid == req.body.id) {
    return res.end(JSON.stringify({
      'success': 'no',
      'msg': 'yourself'
    }));
  }

  var Krathong = db.Krathong;
  Krathong.findById(req.body.id, function (err, kt) {
    if (err) {
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));
    }

    kt.attack = parseInt(kt.attack) + 1;
    if(kt.attack > LIFE && kt.end < kt.start) {
      kt.end = Date.now();

      var log = new db.Log();
      log.message = kt.name + ' has drown.';
      log.timestamp = Date.now();
      log.save();
    }

    kt.save(function (err) {
      if (err) return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));

      return res.end(JSON.stringify({
        'success': 'yes',
        'isDown': (kt.attack > LIFE)
      }));
    });
  });

});

router.get('/me', function(req, res, next) {
  var sess = req.session;

  if(typeof sess.kid !== "string") {
    return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'no krathong'
    }));
  }

  db.Krathong.findById(sess.kid, function (err, kt) {
    if(err) {
      return res.end(JSON.stringify({
        'suscess': 'no',
        'msg': 'error'
      }));
    }

    if(kt == null || typeof kt === "undefined") {
      sess.kid = false;
      sess.die = true;
      sess.save();
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'no data'
      }))
    }

    if(kt.attack > LIFE) {
      req.session.die = true;
      req.session.save();
    }

    return res.end(JSON.stringify({
      success: 'yes',
      name: kt.name,
      attack: kt.attack,
      life: LIFE
    }));
  });
});

router.get('/data', function(req, res, next) {
  var sess = req.session;

  if (typeof sess.fetchtime !== 'undefined' && Date.now() - sess.fetchtime < 1000) {
    sess.fetchtime = Date.now();
    sess.save();
    res.end(JSON.stringify({
      'success': 'no',
      'msg': 'flooding',
      'data': []
    }));
    return ;
  }

  function clean(data) {
    return data.map(function(x) {
      return {
        id: x._id,
        name: x.name,
        attack: x.attack
      };
    });
  }

  var rand = Math.random();
  var Krathong = db.Krathong;
  result = Krathong.find({
    rid: {
      $gte: rand
    },
    attack: {
      $lte: LIFE
    }
  }).limit(40).lean().exec(function(err, data) {
    if(err || data.length === 0) {

      result = Krathong.find({
        rid: {
          $lte: rand
        },
        attack: {
          $lte: LIFE
        }
      }).limit(40).lean().exec(function(err2, datal) {
        if(err2) {
          return res.end(JSON.stringify({
            'success': 'no',
            'msg': 'err',
            'data': []
          }))
        } else {
          return res.end(JSON.stringify({
            'success': 'yes',
            'data': clean(datal)
          }));
        }
      });

    } else {
      return res.end(JSON.stringify({
        'success': 'yes',
        'data': clean(data)
      }));
    }
  });

});

router.get('/log', function(req, res, next) {

  var now = new Date();
  var logDate = new Date(now);
  logDate.setMinutes(logDate.getMinutes() - 10);

  db.Log.find({
    timestamp: {
      $lte: logDate
    }
  }).remove().exec();

  function clean(data) {
    return data.map(function(x) {
      return {
        message: x.message,
        timestamp: x.timestamp
      };
    });
  }

  db.Log.find({}, function(err, data) {
    if(err) {
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));
    }
    return res.end(JSON.stringify(clean(data)));
  });
});

module.exports = router;
