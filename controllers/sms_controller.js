const Case = require("../models/case");
const twilio = require("twilio");
const twilio_client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const moment = require("moment");

const reply_post = (req, res) => {
  // Validate the POST is from twilio
  if (
    twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      req.headers["x-twilio-signature"],
      "https://www.blood-alert.com/reply",
      req.body
    )
  ) {
    // Update case to include snooze time
    Case.updateOne(
      { userPhone: req.body.From },
      { $set: { snoozedUntil: moment().add(user.snoozeMinutes, "m") } }
    ).then(() => {
      // Text back to user
      twilio_client.messages.create({
        body: `Dismissal received! Snoozing for ${user.snoozeMinutes} minutes.`,
        from: process.env.PHONE_NUMBER,
        to: user.phoneNumber,
      });
    });
    res.end();
  }
  // If POST not from twilio
  else {
    res.send("Nice try!");
  }
};

module.exports = {
  reply_post,
};
