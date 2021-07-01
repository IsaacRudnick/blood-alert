const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '931638414558-j7n73fhlap5mo2euigehbuguo40vka0j.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user');

//ROUTING
const index_get = (req, res) => { res.render('index', { title: 'Home' }); };

const login_get = (req, res) => { res.render('login', { title: 'Login' }); };

const signin_get = (req, res) => { res.render('signup', { title: 'Signup' }); };

const profile_get = (req, res) => {

  let user = req.user;
  // console.log(user)
  let token = req.cookies['session-token']
  // let token = req.body['session-token'];

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // console.log(ticket.payload.email) // User email
    const userid = payload['sub'];
  }

  verify()
    .then(() => {
      res.render('profile', { title: 'Profile', user });;
    })
    .catch(console.error);

};

const logout_get = (req, res) => {
  res.clearCookie("session-token");
  console.log("session-token cleared")

  res.redirect("/login");
};

const login_post = (req, res) => {

  let token = req.body.id_token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // console.log(ticket.payload.email) // User email
    const userid = payload['sub'];
  }


  verify()
    .then(() => {

      res.cookie('session-token', token);
      res.redirect('/profile')
      // res.send('success');
    })
    .catch(console.error);

};

// https://github.com/conorbailey90/Google-Auth/blob/main/server.js

module.exports = {
  index_get,
  login_get,
  signin_get,
  profile_get,
  logout_get,
  login_post
}
