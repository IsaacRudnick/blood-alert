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
    // which number to text if user doesn't respond (family, friend, etc.) Emergency Contact Phone Number
    ECphoneNumber: { type: String },
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