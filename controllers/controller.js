const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '931638414558-j7n73fhlap5mo2euigehbuguo40vka0j.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user');

//ROUTING

// GET REQUESTS
const index_get = (req, res) => { res.render('index', { title: 'Home' })};

const login_get = (req, res) => { res.render('login', { title: 'Login' })};

const signin_get = (req, res) => { res.render('signup', { title: 'Signup' })};

const logout_get = (req, res) => {
  res.clearCookie("JWT");
  res.redirect("/login");
};

const profile_get = (req, res) => {res.render('profile', { title: 'Profile', email: req.email })};

// POST REQUESTS
const login_post = (req, res) => {

  let token = req.body.id_token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    return payload;
  }


  verify()
    .then((payload) => {
      jwt_token = jwt.sign({ email: payload.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
      res.cookie('JWT', jwt_token);
      res.redirect('/profile');
    })
    .catch(console.error);

};

const profile_post = (req, res) => {
  delete req.body['_csrf']
  console.log(req.body)
  //Verify input is valid
  // Update database
};


module.exports = {
  index_get,
  login_get,
  signin_get,
  logout_get,
  profile_get,
  login_post,
  profile_post
}
