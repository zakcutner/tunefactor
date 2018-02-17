const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type:String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
},{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);
var users = mongoose.model('User', userSchema);


module.exports = users;
