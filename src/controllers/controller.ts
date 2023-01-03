import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";
import * as env from "../util/secrets.js";
const CLIENT_ID = env.OAUTH_CLIENT_ID;
const oauth2_client = new OAuth2Client(CLIENT_ID);
import User from "../models/user.js";
import logger from "../util/logger.js";
import { UserObj } from "../@types/DBObjects/index.js";
import { QueryOptions } from "mongoose";

//ROUTING
/* ============================== GET REQUESTS ============================== */
const index_get = async (req: Request, res: Response) => {
  res.render("index", { title: "Home", OAUTH_CLIENT_ID: CLIENT_ID, agent: req.useragent });
};

// Clears cookies and redirects to index
const logout_get = async (req: Request, res: Response) => {
  res.clearCookie("JWT");
  res.redirect("/");
};

const profile_get = async (req: Request, res: Response) => {
  // @ts-ignore because TS doesn't know that JWT cookie will have ID property
  let id: string = jwt.decode(req!.cookies!.JWT).id;
  // Checks user ID using JWT
  // Find user and pre fill profile.ejs form with info
  // User won't be null but TS doesn't know that

  let user: UserObj | null = await User.findById({ _id: id });
  res.render("profile", { title: "Profile", user: user, OAUTH_CLIENT_ID: CLIENT_ID, agent: req.useragent });
};

/* ============================== POST REQUESTS ============================= */
const login_post = async (req: Request, res: Response) => {
  // For simplicity and cleaner debugging.
  let token = req.body.id_token;

  const ticket = await oauth2_client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
  const payload: any = ticket.getPayload();

  var query = { email: payload.email },
    update = {},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

  // Find existing user or create new user if not found
  let user: UserObj | null = await User.findOneAndUpdate(query, update, options);
  let jwt_token: string = jwt.sign({ id: user!.id }, env.ACCESS_TOKEN_SECRET, { expiresIn: "3d" });
  if (env.NODE_ENV === "dev") {
    res.cookie("JWT", jwt_token, { httpOnly: true });
  } else {
    // If in production, set secure to true
    res.cookie("JWT", jwt_token, { httpOnly: true, secure: true });
  }
  // finally:
  res.redirect("/profile");
};

const profile_post = async (req: Request, res: Response) => {
  // For simplicity and cleaner debugging.
  const dataSource: string = req.body.dataSource;
  const authToken: string | null = req.body.authToken;
  const phoneNumber: string = req.body.phoneNumber;
  const highThreshold: number = req.body.highThreshold;
  const lowThreshold: number = req.body.lowThreshold;
  const ECphoneNumber: string = req.body.ECphoneNumber;
  const textECAfter: number = req.body.textECAfter;
  const snoozeMinutes: number = req.body.snoozeMinutes;

  // Only call updateUser if all checks pass
  if (
    // Note these function types are defined in this project (@types/validator/index.d.ts)
    validator.isURL(dataSource) &&
    validator.isMobilePhone(phoneNumber, "any", { strictMode: true }) &&
    validator.isInt(highThreshold, { min: 1, max: 400 }) &&
    validator.isInt(lowThreshold, { min: 1, max: 400 }) &&
    validator.isMobilePhone(ECphoneNumber, "any", { strictMode: true }) &&
    validator.isInt(textECAfter) &&
    validator.isInt(snoozeMinutes)
  ) {
    //Creates new object so client can't pass extra fields (add spam to req.body fields which would then go to DB)
    var validated_input: any = {};
    validated_input.dataSource = dataSource;
    validated_input.phoneNumber = phoneNumber;
    validated_input.highThreshold = highThreshold;
    validated_input.lowThreshold = lowThreshold;
    validated_input.ECphoneNumber = ECphoneNumber;
    validated_input.textECAfter = textECAfter;
    validated_input.snoozeMinutes = snoozeMinutes;

    let options: QueryOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
    // .lean() returns a plain javascript object instead of a mongoose document
    let user: UserObj = await User.findByIdAndUpdate(req.id, validated_input, options).lean();

    logger.debug("Updated user: ", user);
    res.render("profile", {
      title: "Profile",
      user: user,
      OAUTH_CLIENT_ID: CLIENT_ID,
      agent: req.useragent,
    });
  }
  // If error, send error message to client
  else {
    res.send("There appears to be an error with your form. Please reach out via email for assistance.");
  }
};

// Export functions
export { index_get, logout_get, profile_get, login_post, profile_post };
