const twilio = require('twilio');
require('dotenv').config();
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// User model for DB
const User = require('../models/user');
// Case model for DB
const Case = require('../models/case');
// Scheduling
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler')
const scheduler = new ToadScheduler()
// get JSON from internet
const fetch = require('node-fetch');
const { exists } = require('../models/user');

// Begin user check in job
async function user_warning(user, info) {
    // Text user
    client.messages.create({
        body: `${info.warning} detected. Reply "X" if safe`,
        from: process.env.PHONE_NUMBER, to: user.phoneNumber
    })
        // Create case in DB
        .then(Case.create({
            // user ID
            userID: user._id,
            // type of warning (high, low, OOR, etc.)
            warning: info.warning,
            // user phone number
            userPhone: user.phoneNumber,
        },
            (err, docs) => {
                if (err) { console.log(err) }
                // Run this function after the user's max response time is up to see if they've responded
                setTimeout(() => {
                    // Check if user has responded (if they have, the case will be deleted in the DB)
                    Case.deleteOne({ _id: docs._id })
                        .then((case_info) => {
                            if (case_info.deletedCount == 0) { return }
                            else {
                                client.messages.create({
                                    body: `${info.warning} detected ${user.textECAfter} minutes ago with no response since.`,
                                    from: process.env.PHONE_NUMBER, to: user.phoneNumber
                                })
                                    .then(() => { })
                            }
                        })
                }, user.textECAfter * 60 * 1000)
            })
        );
}

// connect to DB and check all values
async function check_all_bgs() {
    console.log(`It is ${new Date()}`);
    console.log("Checking all bg values...")
    User.find({}, (err, docs) => {
        if (err) { console.log(err) }
        // Only run if user has a data source set up
        for (var i = 0; i < docs.length; i++) {
            user = docs[i];
            if (!user.userDataSource) { continue }
            url = "https://" + user.userDataSource + "/api/v2/entries.json"
            fetch(url, { method: "GET" })
                .then(res => res.json())
                .then(json => {
                    console.log(`${user.email}'s BG is ${json[0]['sgv']}`)
                    if (json[0]['sgv'] > user.highValue) {
                        console.log("Sending high SMS")
                        user_warning(user, { bg_value: json[0]['sgv'], warning: "High blood sugar" })
                    }
                    else if (json[0]['sgv'] < user.lowValue) {
                        console.log("Sending low SMS")
                        user_warning(user, { bg_value: json[0]['sgv'], warning: "Low blood sugar" })
                    }
                });
        }
    })
}


const check_all_bgs_task = new AsyncTask('check all BGs', check_all_bgs, (err) => { console.log(err) })

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_bgs_task))