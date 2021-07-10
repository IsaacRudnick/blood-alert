const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//User will later add in other data or information
const userSchema = new Schema({
    // user email
    email: { type: String },
    // user's phone number
    phoneNumber: { type: String },
    // high threshold for user
    highValue: { type: Number },
    // low threshhold for user
    lowValue: { type: String },
    // which numbers to text if user doesn't respond (family, friends, etc.) Emergency Contact Phone Number
    // Key is name and value is phone number. For example, 
    ECphoneNumbers: { type: Array },
    // how long out-of-range readings must continue before ECs are texted with alert
    textECsAfter: { type: String },
    // How long to wait before checking on user again. Minutes
    userOkSnooze: { type: Number },
    //user data source (NS such as example-bg.herokuapp.com/)
    userDataSource: { type: String }
},
    { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;