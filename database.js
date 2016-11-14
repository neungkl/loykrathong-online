var mongoose = require('mongoose');
var config = require('./config');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.connect(config.db_connect);

var Krathong = new Schema({
    id: ObjectId,
    name: String,
    attack: { type: Number, index: true },
    rid: { type: Number, index: true },
    start: Date,
    end: Date
});

var Log = new Schema({
  message: String,
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = {
  krathongSchema: Krathong,
  Krathong: mongoose.model('Krathong', Krathong),
  logSchema: Log,
  Log: mongoose.model('Log', Log),
  connection: mongoose.connection
}
