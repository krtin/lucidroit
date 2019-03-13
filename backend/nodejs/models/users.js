const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    facebookId: {
      type: String
    },
    authtype: {
      type: String,
      required: true
    },
    accesslevel: {
      type: Number,
      default: 0
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String
    },
    image: {
      type: String
    },
    active:   {
        type: Boolean,
        default: false
    }
    }, {
    timestamps: true
    });

userSchema.plugin(passportLocalMongoose);

var Users = mongoose.model('User', userSchema);



module.exports = Users;
