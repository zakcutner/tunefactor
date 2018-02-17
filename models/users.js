const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  username: String,
  password: String
});

User.plugin(passportLocalMongoose);
var User = mongoose.model('User', User);


module.exports = User;
