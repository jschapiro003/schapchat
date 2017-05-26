var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.set('debug', true);

var UserSchema = new Schema({
  googleId: String,
  googleToken: String,
  googleName: String,
  googleEmail: String,
  isSubscribed: Boolean
});

module.exports = mongoose.model('User', UserSchema);