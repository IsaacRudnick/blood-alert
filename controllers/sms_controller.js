const index_post = (req, res) => {
    console.log(req.body);
    res.send("ok");
}

module.exports = {
    index_post
}