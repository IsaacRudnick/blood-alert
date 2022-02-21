const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Autogeneated by app. Use to create new case.
const caseSchema = new Schema({
    // user ID
    userID: { type: String },
    // type of warning (high, low, OOR, etc.)
    warning: { type: String },
    // user's phone number
    userPhone: { type: String },
},
    { timestamps: true });

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;