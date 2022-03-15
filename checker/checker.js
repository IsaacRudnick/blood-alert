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
const { text } = require("express");

// Recreate all user cases
function recreate_cases() {
  // Get all cases from DB
  Case.find({}, (err, docs) => {
    if (err) {
      console.log(err);
    }
    // For each case
    for (var i = 0; i < docs.length; i++) {
      // "case" is reserved in JS so "case_" is used instead
      case_ = docs[i];
      // Get the user associated with the case
      User.findById({ _id: case_.userID }, (err, user) => {
        if (err) {
          console.log(err);
        }
        // Text user about outage
        twilio_client.messages
          .create({
            body: `Our service was interrupted during an active case for ${user.email}. Respond within ${user.textECAfter} minutes or your emergency contact will be notified.`,
            from: process.env.PHONE_NUMBER,
            to: user.phoneNumber,
          })
          // Delete old case from DB
          .then(Case.deleteOne({ _id: case_._id }))
          // Create new case (both DB document AND timeout function)
          .then(create_new_case(user, { warning: case_.warning }, (text_user = false)));
      });
    }
  });
}

/* This function:
-creates a case in MongoDB
-texts the user to check on them
-creates a deadman function, which checks to see if case
still exists after user.textECAfter minutes expires and texts
EC if it does still exist. 
*/
async function create_new_case(user, info, text_user = true) {
  // Text user if text_user is true
  if (text_user) {
    twilio_client.messages
      .create({
        body: `${info.warning} detected. Reply within ${user.textECAfter} minutes if safe`,
        from: process.env.PHONE_NUMBER,
        to: user.phoneNumber,
        // Create Case
      })
      .then();
  }
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
  );
}

// connect to DB and check all values
async function check_all_bgs() {
  console.log(`It is ${new Date()}`);
  console.log("Checking all bg values...");

  // Get only users with a data source set up
  User.find({ dataSource: { $ne: null } }, (err, docs) => {
    if (err) {
      console.log(err);
    }
    // For each user
    for (var i = 0; i < docs.length; i++) {
      user = docs[i];
      Case.find({ userID: user._id }, (err, docs) => {
        // If there are cases for the user, skip their check
        if (docs.length > 0) return;
        // Otherwise, do standard checks

        url = "https://" + user.dataSource + "/api/v2/entries.json";
        // Get user BG
        fetch(url, { method: "GET" })
          .then((res) => res.json())
          .then((json) => {
            // Output user BG
            console.log(`${user.email}'s BG is ${json[0]["sgv"]}`);

            // If high or low, create respective user warning

            // case for high BG
            if (json[0]["sgv"] > user.highThreshold) {
              console.log("Sending high SMS");
              create_new_case(user, { warning: "high blood sugar" });
            }
            // case for low BG
            else if (json[0]["sgv"] < user.lowThreshold) {
              console.log("Sending low SMS");
              create_new_case(user, { warning: "low blood sugar" });
            }
          });
      });
    }
  });
}

// Before the standard checker loop starts, recreate all cases
recreate_cases();

// Create task to check all BGs and schedule it for every 5 minutes (and immediately)
const check_all_bgs_task = new AsyncTask("check all BGs", check_all_bgs, (err) => {
  console.log(err);
});

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_bgs_task));
