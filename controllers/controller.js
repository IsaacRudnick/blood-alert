const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '931638414558-j7n73fhlap5mo2euigehbuguo40vka0j.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user');

//ROUTING

// GET REQUESTS
const index_get = (req, res) => { res.render('index', { title: 'Home' }) };

const login_get = (req, res) => { res.render('login', { title: 'Login' }) };

const logout_get = (req, res) => {
  res.clearCookie("JWT");
  res.redirect("/login");
};

const profile_get = (req, res) => { res.render('profile', { title: 'Profile', email: req.email }) };

// POST REQUESTS
const login_post = (req, res) => {

  let token = req.body.id_token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();

    var query = { "email": payload.email },
      update = {},
      options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const user = await User.findOneAndUpdate(query, update, options);
    return user
  }

  verify()
    .then((user) => {
      jwt_token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
      res.cookie('JWT', jwt_token);
      res.redirect('/profile');
    })
    .catch(console.error);

};

const profile_post = (req, res) => {
  delete req.body['_csrf'];
  delete req.body['email'];


  //Verify input is valid
  // Update database

  async function updateUser() {

    options = { upsert: true, new: true, setDefaultsOnInsert: true };

    await User.findByIdAndUpdate(req.id, req.body, options, (err, docs) => {
      if (err) {
        console.log(err)
      }
      else {
        console.log("Updated user: ", docs)
      }
    })
  }
  updateUser()
};


module.exports = {
  index_get,
  login_get,
  logout_get,
  profile_get,
  login_post,
  profile_post
}
