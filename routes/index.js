var express = require('express');
var router = express.Router();
var db = require('../database');

/* GET home page. */

router.post('/add', function(req, res, next) {
  var sess = req.session;

  if (sess.die == false) {
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

    sess.die = false;
    sess.save();

    instance.save(function(err) {
      if (err) {
        res.end(JSON.stringify({
          'success': 'no',
          'msg': 'save error'
        }));
      } else {
        res.end('{"success": "yes"}');
      }
    });

  }
});

router.post('/attack', function(req, res, next) {
  var sess = req.session;

  if (session.die == true) {
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

  var Krathong = db.Krathong;
  Krathong.findById(req.body.id, function (err, kt) {
    if (err) {
      console.log(err);
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));
    }

    kt.attack = parseInt(kt.attack) + 1;
    if(kt.attack >= 10 && kt.end === 0) {
      kt.end = Date.now();

      var log = new dbc.logSchema();
      log.message = instance.name + ' has drown.';
      log.timestamp = Date.now();
      log.save();
    }

    kt.save(function (err) {
      if (err) return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));

      return res.end(JSON.stringify({
        'success': 'yes'
      }));
    });
  });

});

router.post('/me', function(req, res, next) {
  var sess = req.session;

  if(typeof req.body.id !== "string") {
    return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'not a string'
    }));
  }

  db.Krathong.findById(req.body.id, function (err, kt) {
    delete kt._id;
    delete kt.__v;
    delete kt.start;
    delete kt.end;
    delete kt.rid;

    if(kt.attack >= 10) {
      req.session.die = true;
      req.session.save();
    }

    return res.end(JSON.stringify(kt));
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
      delete x.__v;
      delete x.start,
      delete x.end;
      delete x.rid;
      return x;
    });
  }

  var rand = Math.random();
  var Krathong = db.Krathong;
  result = Krathong.find({
    rid: {
      $gte: rand
    }
  }).limit(100).lean().exec(function(err, data) {
    if(err || data.length === 0) {

      result = Krathong.find({
        rid: {
          $lte: rand
        }
      }).limit(100).lean().exec(function(err2, datal) {
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
  logDate.setMinutes(logDate.getMinutes() - 5);

  db.Log.find({
    timestamp: {
      $lte: logDate
    }
  }).remove().exec();

  function clean(data) {
    return data.map(function(x) {
      delete x.__v;
      return x;
    });
  }

  db.Log.find({}, function(err, data) {
    if(err) {
      return res.end(JSON.stringify({
        'success': 'no',
        'msg': 'error'
      }));
    }
    console.log(clean(data));
    return res.end(JSON.stringify(clean(data)));
  });
});

module.exports = router;
