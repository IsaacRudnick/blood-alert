import Case from "../models/case.js";
import User from "../models/user.js";
import twilio from "twilio";
import * as env from "../util/secrets.js";
const twilio_client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
import moment from "moment";
import { UserObj } from "../types.js";

const reply_post = async (req, res) => {
  // Validate the POST is from twilio
  const isFromTwilio: boolean = twilio.validateRequest(
    env.TWILIO_AUTH_TOKEN,
    req.headers["x-twilio-signature"],
    "https://www.blood-alert.com/reply",
    req.body
  );
  if (!isFromTwilio) {
    res.send("Nice try!");
    console.log("SMS API request NOT from twilio!");
  }

  // Get user associated with phone number that sent the reply
  let user: UserObj = await User.findOne({ phoneNumber: req.body.From });
  // if phone number is not in DB, end
  if (!user) {
    res.end();
    return;
  }
  // If POST IS from twilio
  // Update case to include snooze time
  await Case.updateOne({ userPhone: req.body.From }, { $set: { snoozedUntil: moment().add(user.snoozeMinutes, "m") } });
  // Text back to user
  twilio_client.messages.create({
    body: `Dismissal received! Snoozing for ${user.snoozeMinutes} minutes.`,
    from: env.TWILIO_PHONE_NUMBER,
    to: user.phoneNumber,
  });

  res.end();
};

export { reply_post };
