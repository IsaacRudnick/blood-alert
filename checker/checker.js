// User Model for DB
const User = require('../models/user');
// Scheduling
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler')
const scheduler = new ToadScheduler()
// get JSON from internet
const fetch = require('node-fetch');

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
                        }
                    });
            }
        }
    })
}

const check_all_task = new AsyncTask('check all BGs', check_all, (err) => { console.log(err) })

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_task))