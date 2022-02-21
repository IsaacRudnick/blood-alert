const express = require('express');
const controller = require('../controllers/sms_controller');
const router = express.Router();

router.post("/reply", controller.reply_post);

module.exports = router;