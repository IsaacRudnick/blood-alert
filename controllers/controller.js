const jwt = require('jsonwebtoken');
const validator = require('validator');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '931638414558-j7n73fhlap5mo2euigehbuguo40vka0j.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const User = require('../models/user');

//ROUTING

// GET REQUESTS
const index_get = (req, res) => {
  res.render('index', { title: 'Home' })
};

const login_get = (req, res) => { res.render('login', { title: 'Login' }) };

// Clears cookies and redirects to /login
const logout_get = (req, res) => {
  res.clearCookie("JWT");
  res.redirect("/login");
};

const profile_get = (req, res) => {
  id = jwt.decode(req.cookies.JWT).id;
  // Checks user ID using JWT
  // Find user and prefill profile.ejs form with info
  User.findById({ _id: id }, (err, user) => {
    if (err) { console.log(err) }
    res.render('profile', { title: 'Profile', user: user, csrftoken: req.csrfToken() });
  })
};

// POST REQUESTS
const login_post = (req, res) => {
  // For simplicity and cleaner debugging.
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
      // {secure: true} for production. 
      res.cookie('JWT', jwt_token, { httpOnly: true });
      res.redirect('/profile');
    })
    .catch(console.error);

};

const profile_post = (req, res) => {
  // For simplicity and cleaner debugging.
  delete req.body['_csrf'];

  phoneNumber = req.body.phoneNumber;
  highValue = req.body.highValue;
  lowValue = req.body.lowValue;
  ECphoneNumber = req.body.ECphoneNumber;
  textECAfter = req.body.textECAfter;
  userOkSnooze = req.body.userOkSnooze;
  userDataSource = req.body.userDataSource;

  // Update database
  async function updateUser(data) {

    await User.findByIdAndUpdate(req.id, data, options, (err, docs) => {
      if (err) {
        console.log(err)
      }
      else {
        console.log("Updated user: ", docs);
        res.render("profile", { title: "Profile", email: req.email });
      }
    }).clone().catch((err) => { console.log(err) })
  }
  // Only call updateUser if all checks pass
  if (
    validator.isMobilePhone(phoneNumber, 'any', { strictMode: true }) &&
    validator.isInt(highValue, { min: 1, max: 400 }) &&
    validator.isInt(lowValue, { min: 1, max: 400 }) &&
    validator.isMobilePhone(ECphoneNumber, 'any', { strictMode: true }) &&
    validator.isInt(textECAfter) &&
    validator.isInt(userOkSnooze) &&
    validator.isURL(userDataSource) && validator.contains(userDataSource, ".herokuapp.com")
  ) {
    //Creates new object so client can't pass extra fields (add spam to req.body fields which would then go to DB)
    var valid_input = {};
    valid_input.phoneNumber = phoneNumber;
    valid_input.highValue = highValue;
    valid_input.lowValue = lowValue;
    valid_input.ECphoneNumber = ECphoneNumber;
    valid_input.textECAfter = textECAfter;
    valid_input.userOkSnooze = userOkSnooze;
    valid_input.userDataSource = userDataSource;


    email = req.email
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    updateUser(valid_input);
  }
  else {
    res.send("There appears to be an error with your form. Please reach out via email for assistance.");
  }

};


module.exports = {
  index_get,
  login_get,
  logout_get,
  profile_get,
  login_post,
  profile_post
}
