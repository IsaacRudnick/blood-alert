const Case = require('../models/case');

const reply_post = (req, res) => {
    console.log(req.body);
    // Case.deleteOne({ userPhone:  })
    res.send("ok");
}

module.exports = {
    reply_post
}