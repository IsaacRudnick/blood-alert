const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//User will later add in other data or information
const userSchema = new Schema({
    // user email
    email: { type: String },
    // users phone number
    phoneNumber: { type: String },
    // which numbers to text if user doesn't respond (family, friends, etc.) Emergency Contact Phone Number
    ECphoneNumbers: { type: Array },
    // how long out-of-range readings must continue before user is texted to make sure they're ok
    textUserAfter: { type: String },
    // whether to keep checking on user every textUserAfter minutes until in-range or no response
    keepTextingUser: { type: Boolean },
    // low threshhold for user
    lowValue: { type: String },
    // high threshold for user
    highValue: { type: String },
    //user data source (NS such as example-bg.herokuapp.com/)
    userDataSource: { type: String }
},
    { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;