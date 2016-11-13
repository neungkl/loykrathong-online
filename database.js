var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://127.0.0.1/loykrathong');

var Kartong = new Schema({
    id: ObjectId,
    name: String,
    attack: { type: Number, index: true },
    rid: { type: Number, index: true },
    start: Date,
    end: Date
});

var Log = new Schema({
  message: String,
  timestamp: { type: Date, default: Date.now }
})

module.exports = {
  karthongSchema: Karthong,
  logSchema: Log,
  connection: mongoose.connection
}
