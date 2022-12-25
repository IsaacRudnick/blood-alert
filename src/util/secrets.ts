console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
// This data accesses the .env file and exports the data as a module
// It also checks to make sure the variables exist.
// However, it DOES NOT check to make sure the variables are valid.
import dotenv from "dotenv";
import fs from "fs";
import logger from "./logger.js";

if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.debug("Using .env.example file to supply config environment variables");
  dotenv.config({ path: ".env.example" }); // you can delete this after you create your own .env file!
}

export const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  logger.error("No NODE_ENV environment variable set.");
  process.exit(1);
}
const prod = NODE_ENV === "prod"; // Anything else is treated as 'dev'

export const PORT: string = process.env.PORT || "8080";
export const DBURI: string = process.env.DBURI;
if (!DBURI) {
  logger.error("No mongo connection string. Set DBURI environment variable.");
  process.exit(1);
}
export const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
  logger.error("No client secret. Set ACCESS_TOKEN_SECRET environment variable.");
  process.exit(1);
}

export const TWILIO_AUTH_TOKEN: string = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_ACCOUNT_SID: string = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_PHONE_NUMBER: string = process.env.TWILIO_PHONE_NUMBER;
if (!TWILIO_AUTH_TOKEN || !TWILIO_ACCOUNT_SID || !TWILIO_PHONE_NUMBER) {
  logger.error(
    "Missing one or more twilio credentials. Set TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, and TWILIO_PHONE_NUMBER environment variables."
  );
  process.exit(1);
}

export const OAUTH_CLIENT_ID: string = process.env.OAUTH_CLIENT_ID;
if (!OAUTH_CLIENT_ID) {
  logger.error("No OAuth client ID. Set OAUTH_CLIENT_ID environment variable.");
  process.exit(1);
}

export const FIREBASE_API_KEY: string = process.env.FIREBASE_API_KEY;
export const FIREBASE_AUTH_DOMAIN: string = process.env.FIREBASE_AUTH_DOMAIN;
export const FIREBASE_PROJECTID: string = process.env.FIREBASE_PROJECTID;
export const FIREBASE_STORAGEBUCKET: string = process.env.FIREBASE_STORAGEBUCKET;
export const FIREBASE_MESSAGINGSENDERID: string = process.env.FIREBASE_MESSAGINGSENDERID;
export const FIREBASE_APPID: string = process.env.FIREBASE_APPID;
export const FIREBASE_MEASUREMENTID: string = process.env.FIREBASE_MEASUREMENTID;
if (
  !FIREBASE_API_KEY ||
  !FIREBASE_AUTH_DOMAIN ||
  !FIREBASE_PROJECTID ||
  !FIREBASE_STORAGEBUCKET ||
  !FIREBASE_MESSAGINGSENDERID ||
  !FIREBASE_APPID ||
  !FIREBASE_MEASUREMENTID
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
  process.exit(1);
}
