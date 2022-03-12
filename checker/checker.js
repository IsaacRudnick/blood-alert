const twilio = require("twilio");
require("dotenv").config();
const twilio_client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// User model for DB
const User = require("../models/user");
// Case model for DB
const Case = require("../models/case");
// Scheduling
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require("toad-scheduler");
const scheduler = new ToadScheduler();
// get JSON from internet
const fetch = require("node-fetch");

/* This function:
-creates a case in MongoDB
-texts the user to check on them
-creates a deadman function, which checks to see if case
still exists after user.textECAfter minutes expires and texts
EC if not. 
*/
async function user_warning(user, info) {
  // Text user
  twilio_client.messages
    .create({
      body: `${info.warning} detected. Reply within ${user.textECAfter} minutes if safe`,
      from: process.env.PHONE_NUMBER,
      to: user.phoneNumber,
      // Create Case
    })
    .then(
      Case.create(
        {
          // user ID
          userID: user._id,
          // type of warning (high, low, OOR, etc.)
          warning: info.warning,
          // user phone number
          userPhone: user.phoneNumber,
        },
        (err, docs) => {
          if (err) {
            console.log(err);
          }
          // Run this function after the user's max response time is up to see if they've responded
          setTimeout(() => {
            // Check if user has responded (if they have, the case will be deleted in the DB)
            Case.deleteOne({ _id: docs._id }).then((case_info) => {
              if (case_info.deletedCount == 0) {
                return;
              } else {
                // If user hasn't responded, text EC
                twilio_client.messages
                  .create({
                    body: `${info.warning} detected ${user.textECAfter} minutes ago with no response since.`,
                    from: process.env.PHONE_NUMBER,
                    to: user.phoneNumber,
                  })
                  .then();
              }
            });
            // Timeout minutes -> milliseconds conversion
          }, user.textECAfter * 60 * 1000);
        }
      )
    );
}

// connect to DB and check all values
async function check_all_bgs() {
  console.log(`It is ${new Date()}`);
  console.log("Checking all bg values...");

  // Get only users with a data source set up
  User.find({ userDataSource: { $ne: null } }, (err, docs) => {
    if (err) {
      console.log(err);
    }
    for (var i = 0; i < docs.length; i++) {
      user = docs[i];
      url = "https://" + user.userDataSource + "/api/v2/entries.json";
      // Get user BG
      fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((json) => {
          // Output user BG
          console.log(`${user.email}'s BG is ${json[0]["sgv"]}`);

          // If high or low, create respective user warning

          // case for high BG
          if (json[0]["sgv"] > user.highValue) {
            console.log("Sending high SMS");
            user_warning(user, {
              bg_value: json[0]["sgv"],
              warning: "Low blood sugar",
            });
          }
          // case for low BG
          else if (json[0]["sgv"] < user.lowValue) {
            console.log("Sending low SMS");
            user_warning(user, {
              bg_value: json[0]["sgv"],
              warning: "High blood sugar",
            });
          }
        });
    }
  });
}
// Create task to check all BGs and schedule it for every 5 minutes (and immediately)
const check_all_bgs_task = new AsyncTask("check all BGs", check_all_bgs, (err) => {
  console.log(err);
});

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_bgs_task));
