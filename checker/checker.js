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

// Begin user check in job
async function user_warning(user, info) {
    // Create user text job w/ ID to cancel if necessary
    const textECafterTimeoutJob = setTimeout(() => {
        client.messages
            .create({ body: `${info.warning} detected. Reply "X" if safe`, from: process.env.PHONE_NUMBER, to: user.phoneNumber })
            .then(message => console.log(message.sid));
    }, user.textECsAfter)


    // must create task object with: startTime, ID to cancel, when to text, 
    // Create case in DB
    // Case.create({    // user ID
    //     userID: user._id,
    //     // ID of case task in scheduler system
    //     taskID: task.TaskID,
    //     // type of warning (high, low, OOR, etc.)
    //     warning: info.warning,
    //     // time of warning
    //     time: task.startTime,
    // })
    // Text user emergency contact
}

// connect to DB and check all values
async function check_all() {
    console.log(`It is ${new Date()}`);
    console.log("Checking all values...")
    User.find({}, (err, docs) => {
        if (err) { console.log(err) }
        else {
            for (var i = 0; i < docs.length; i++) {
                user = docs[i];
                url = "https://" + user.userDataSource + "/api/v2/entries.json"
                fetch(url, { method: "Get" })
                    .then(res => res.json())
                    .then(json => {
                        console.log(`${user.email}'s BG is ${json[0]['sgv']}`)
                        if (json[0]['sgv'] > user.highValue) {
                            // Send low SMS
                            console.log("Sending high SMS")
                        }
                        else if (json[0]['sgv'] < user.lowValue) {
                            console.log("Sending low SMS")
                            user_warning(user, { bg_value: json[0]['sgv'], warning: "low blood sugar" })
                        }
                    });
            }
        }
    })
}

const check_all_task = new AsyncTask('check all BGs', check_all, (err) => { console.log(err) })

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_task))