const Case = require('../models/case');
const twilio = require('twilio');
const twilio_client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const reply_post = (req, res) => {
  // Validate the POST is from twilio
  if (twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, req.headers["x-twilio-signature"], "https://www.blood-alert.com/reply", req.body)){
    // Delete cases with sender phone #
    Case.deleteMany({ userPhone: req.body.From}).then(() => {
      // Text back to user
      twilio_client.messages.create({
          body: `Dismissal recieved!`,
          from: process.env.PHONE_NUMBER, to: user.phoneNumber
      })
    })
    res.end();
  }
  // If POST not from twilio
  else {res.send("Nice try!");}
}

module.exports = {
    reply_post
}