// This data accesses the .env file and exports the data as a module
// It also checks to make sure the variables exist.
// However, it DOES NOT check to make sure the variables are valid,
// with the exception of the NODE_ENV variable.
import dotenv from "dotenv";
import fs from "fs";
import logger from "./logger.js";

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config();
} else {
  logger.error(".env file not found. Please create one, following example in .env.example");
  logger.end();
}

export const NODE_ENV = process.env.NODE_ENV;
// NODE_ENV is the only variable that is checked for validity.
if (!NODE_ENV || (NODE_ENV != "dev" && NODE_ENV != "prod")) {
  logger.error("No NODE_ENV environment variable set.");
  logger.end();
}
const prod = NODE_ENV === "prod"; // Anything else is treated as 'dev'

export const PORT: string = process.env.PORT || "8080";
export const DBURI: string = process.env.DBURI;
if (!DBURI) {
  logger.error("No mongo connection string. Set DBURI environment variable.");
  logger.end();
}
export const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  logger.error("No client secret. Set ACCESS_TOKEN_SECRET environment variable.");
  logger.end();
}

export const TWILIO_AUTH_TOKEN: string = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_ACCOUNT_SID: string = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_PHONE_NUMBER: string = process.env.TWILIO_PHONE_NUMBER;
if (!TWILIO_AUTH_TOKEN || !TWILIO_ACCOUNT_SID || !TWILIO_PHONE_NUMBER) {
  logger.error(
    "Missing one or more twilio credentials. Set TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, and TWILIO_PHONE_NUMBER environment variables."
  );
  logger.end();
}

export const OAUTH_CLIENT_ID: string = process.env.OAUTH_CLIENT_ID;
if (!OAUTH_CLIENT_ID) {
  logger.error("No OAuth client ID. Set OAUTH_CLIENT_ID environment variable.");
  logger.end();
}

export const FIREBASE: any = {
  API_KEY: process.env.FIREBASE_API_KEY,
  AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  PROJECTID: process.env.FIREBASE_PROJECTID,
  STORAGEBUCKET: process.env.FIREBASE_STORAGEBUCKET,
  MESSAGINGSENDERID: process.env.FIREBASE_MESSAGINGSENDERID,
  APPID: process.env.FIREBASE_APPID,
  MEASUREMENTID: process.env.FIREBASE_MEASUREMENTID,
};
if (
  !FIREBASE.API_KEY ||
  !FIREBASE.AUTH_DOMAIN ||
  !FIREBASE.PROJECTID ||
  !FIREBASE.STORAGEBUCKET ||
  !FIREBASE.MESSAGINGSENDERID ||
  !FIREBASE.APPID ||
  !FIREBASE.MEASUREMENTID
) {
  logger.error(
    "Missing one or more firebase credentials. Set \
    FIREBASE_API_KEY, \
    FIREBASE_AUTH_DOMAIN, \
    FIREBASE_PROJECTID, \
    FIREBASE_STORAGEBUCKET, \
    FIREBASE_MESSAGINGSENDERID, \
    FIREBASE_APPID, and \
    FIREBASE_MEASUREMENTID environment variables."
  );
  logger.end();
}