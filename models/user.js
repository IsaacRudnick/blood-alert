const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//User will later add in other data or information
const userSchema = new Schema({
    // user email
    email: { type: String, required: true },
    // user's phone number
    phoneNumber: { type: String, required: true },
    // high threshold for user
    highValue: { type: String, required: true },
        // low threshhold for user
    lowValue: { type: String, required: true },
    // which numbers to text if user doesn't respond (family, friends, etc.) Emergency Contact Phone Number
    // Key is name and value is phone number. For example, 
    // { "John": "+1 123-456-7890", "Greg": "+1 222-333-4444" }
    ECphoneNumbers: { type: Object, required: true },
    // how long out-of-range readings must continue before ECs are texted with alert
    textECsAfter: { type: String, required: true },
    // How long to wait before checking on user again. Minutes
    userOkSnooze: {type: Number, required: true},
    //user data source (NS such as example-bg.herokuapp.com/)
    userDataSource: { type: String, required: true }
},
    { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;