import * as env from "../util/secrets.js";
import logger from "../util/logger.js";
import twilio from "twilio";
const twilio_client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
import User from "../models/user.js";
import Case from "../models/case.js";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
const scheduler = new ToadScheduler();
import fetch from "node-fetch";
import { UserObj, CaseObj } from "../@types/DBObjects/index.js";

/**
 * This function:
 * - gets all active cases from DB
 * - texts the user about the outage
 * - deletes the old case from DB
 * - creates a new case (both DB document AND timeout function)
 */
async function recreate_cases() {
  // Get all active (not snoozed) cases from DB
  let cases = await Case.find({ snoozedUntil: null });

  // For each case
  for (var i = 0; i < cases.length; i++) {
    // "case" is reserved in JS so "case_" is used instead
    let case_: CaseObj = cases[i];
    // Get the user associated with the case
    // User won't be null but TS doesn't know that
    let user: UserObj | null = await User.findById({ _id: case_.userID });
    // Text user about outage
    await twilio_client.messages.create({
      body: `Our service was interrupted during an active case for ${user!.email}. Respond within ${
        user!.textECAfter
      } minutes or your emergency contact will be notified.`,
      from: env.TWILIO_PHONE_NUMBER,
      to: user!.phoneNumber,
    });
    // Delete old case from DB
    await Case.deleteOne({ _id: case_._id });
    // Create new case (both DB document AND timeout function)
    await create_new_case(user, { warning: case_.warning }, false);
  }
}

/**
 * This function:
 * - creates a case in MongoDB
 * - texts the user to check on them
 * - creates a 'deadman switch' function, which checks to see if case
 * still exists after user.textECAfter minutes expires and texts
 * EC if it does still exist.
 *
 * @param {user} user - user to text
 * @param {Object} info - {warning: string}
 * @param {boolean} text_user - whether or not to text the user
 */
// TODO: Add types for user and info objects
async function create_new_case(user: any, info: any, text_user: boolean = true) {
  // Text user if text_user is true
  if (text_user) {
    await twilio_client.messages.create({
      body: `${info.warning} detected. Reply within ${user.textECAfter} minutes if safe`,
      from: env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
      // Create Case
    });
  }
  let case_: CaseObj = await Case.create({
    // user ID
    userID: user._id,
    // type of warning (high, low, OOR, etc.)
    warning: info.warning,
    // user phone number
    userPhone: user.phoneNumber,
  });

  let timeoutFunction = async () => {
    // Check if user has responded (if they have, the case will be deleted in the DB)
    let case_info = await Case.deleteOne({ _id: case_._id });

    if (case_info.deletedCount === 0) {
      return;
    }
    // If user hasn't responded, text EC
    await twilio_client.messages.create({
      body: `${info.warning} detected ${user.textECAfter} minutes ago with no response since.`,
      from: env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber,
    });
  };

  // Run that function after the user's max response time is up to see if they've responded
  setTimeout(
    timeoutFunction,
    // Timeout minutes -> milliseconds conversion
    user.textECAfter * 60 * 1000
  );
}

// connect to DB and check all values
/**
 * This function:
 * - gets all users with a data source set up
 * - for each user, gets their BG value
 * - if high or low, creates a case
 * - if a case already exists, skips user
 */
async function check_all_bgs() {
  logger.info("Checking all bg values...");

  // Get only users with a data source set up
  let users = await User.find({ dataSource: { $ne: null } });
  // For each user
  for (var i = 0; i < users.length; i++) {
    let user: UserObj = users[i];

    // Delete case iff snooze time has passed
    await Case.deleteOne({ userID: user._id, snoozedUntil: { $lte: Date.now() } });

    // If an existing case exists, skip this user
    if (Case.findOne({ userID: user._id }) != null) {
      return;
    }
    // Otherwise, do standard checks
    let url: string = "https://" + user.dataSource + "/api/v2/entries.json";
    // Get user BG
    let json: any = await (await fetch(url, { method: "GET" })).json();
    // Output user BG
    logger.debug(`${user.email}'s BG is ${json[0]["sgv"]}`);

    // If high or low, create respective user warning
    // case for high BG
    if (json[0]["sgv"] > user.highThreshold) {
      logger.debug("Sending high SMS");
      create_new_case(user, { warning: "high blood sugar" });
    }
    // case for low BG
    else if (json[0]["sgv"] < user.lowThreshold) {
      logger.debug("Sending low SMS");
      create_new_case(user, { warning: "low blood sugar" });
    }
  }
}

// Before the standard checker loop starts, recreate all cases in case of server restart
recreate_cases();

// Create task to check all BGs and schedule it for every 5 minutes (and immediately)
const check_all_bgs_task = new AsyncTask("check all BGs", check_all_bgs);

scheduler.addSimpleIntervalJob(new SimpleIntervalJob({ minutes: 5, runImmediately: true }, check_all_bgs_task));
