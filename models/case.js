const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Autogeneated by app. Use to create new case.
const caseSchema = new Schema({
    // user ID
    userID: { type: String },
    // ID of case task in scheduler system
    taskID: { type: Number },
    // type of warning (high, low, OOR, etc.)
    warning: { type: String },
    // time of warning
    time: { type: String },
},
    { timestamps: true });

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;