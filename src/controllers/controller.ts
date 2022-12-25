import jwt from "jsonwebtoken";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";
import * as env from "../util/secrets.js";
const CLIENT_ID = env.OAUTH_CLIENT_ID;
const oauth2_client = new OAuth2Client(CLIENT_ID);
import User from "../models/user.js";
import { UserObj } from "../types.js";
//ROUTING

/* ============================== GET REQUESTS ============================== */
const index_get = async (req, res) => {
  res.render("index", { title: "Home" });
};

const login_get = async (req, res) => {
  res.render("login", { title: "Login" });
};

// Clears cookies and redirects to /login
const logout_get = async (req, res) => {
  res.clearCookie("JWT");
  res.redirect("/login");
};

const profile_get = async (req, res) => {
  let id: string = jwt.decode(req.cookies.JWT).id;
  // Checks user ID using JWT
  // Find user and pre fill profile.ejs form with info
  let user: UserObj = await User.findById({ _id: id });
  res.render("profile", { title: "Profile", user: user });
};

/* ============================== POST REQUESTS ============================= */
const login_post = async (req, res) => {
  // For simplicity and cleaner debugging.
  let token = req.body.id_token;

  const ticket = await oauth2_client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
  const payload = ticket.getPayload();

  var query = { email: payload.email },
    update = {},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  // Find existing user or create new user if not found
  let user: UserObj = await User.findOneAndUpdate(query, update, options);
  let jwt_token: string = jwt.sign({ id: user.id }, env.ACCESS_TOKEN_SECRET, { expiresIn: "3d" });
  if (env.NODE_ENV == "dev") {
    res.cookie("JWT", jwt_token, { httpOnly: true });
  } else {
    // If in production, set secure to true
    res.cookie("JWT", jwt_token, { httpOnly: true, secure: true });
  }
  // finally:
  res.redirect("/profile");
};

const profile_post = async (req, res) => {
  // For simplicity and cleaner debugging.
  const phoneNumber: string = req.body.phoneNumber;
  const highThreshold: number = req.body.highThreshold;
  const lowThreshold: number = req.body.lowThreshold;
  const ECphoneNumber: string = req.body.ECphoneNumber;
  const textECAfter: number = req.body.textECAfter;
  const snoozeMinutes: number = req.body.snoozeMinutes;
  const dataSource: string = req.body.dataSource;

  // Only call updateUser if all checks pass
  if (
    validator.isMobilePhone(phoneNumber, "any", { strictMode: true }) &&
    validator.isInt(highThreshold, { min: 1, max: 400 }) &&
    validator.isInt(lowThreshold, { min: 1, max: 400 }) &&
    validator.isMobilePhone(ECphoneNumber, "any", { strictMode: true }) &&
    validator.isInt(textECAfter) &&
    validator.isInt(snoozeMinutes) &&
    validator.isURL(dataSource) &&
    validator.contains(dataSource, ".herokuapp.com")
  ) {
    //Creates new object so client can't pass extra fields (add spam to req.body fields which would then go to DB)
    var validated_input: any = {};
    validated_input.phoneNumber = phoneNumber;
    validated_input.highThreshold = highThreshold;
    validated_input.lowThreshold = lowThreshold;
    validated_input.ECphoneNumber = ECphoneNumber;
    validated_input.textECAfter = textECAfter;
    validated_input.snoozeMinutes = snoozeMinutes;
    validated_input.dataSource = dataSource;

    let options: any = { upsert: true, new: true, setDefaultsOnInsert: true };
    // .lean() returns a plain javascript object instead of a mongoose document
    let user: UserObj = await User.findByIdAndUpdate(req.id, validated_input, options).lean();

    console.log("Updated user: ", user);
    res.render("profile", { title: "Profile", user: user });
  }
  // If error, send error message to client
  else {
    res.send("There appears to be an error with your form. Please reach out via email for assistance.");
  }
};

// Export functions
export { index_get, login_get, logout_get, profile_get, login_post, profile_post };
