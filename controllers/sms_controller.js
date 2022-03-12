const Case = require('../models/case');
const twilio = require('twilio');

const reply_post = (req, res) => {
  if (twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, req.headers["x-twilio-signature"], "https://www.blood-alert.com/reply", req.body)){
    Case.deleteMany({ userPhone: req.body.From})
  res.end();}
  else {res.send("Nice try!");}
}

module.exports = {
    reply_post
}