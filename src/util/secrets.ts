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

// If not a string, an error will be thrown, so we don't need to check for validity.
let node_env: string | undefined = process.env.NODE_ENV;
// NODE_ENV is the only variable that is checked for validity.
if (!node_env || (node_env != "dev" && node_env != "prod")) {
  logger.error("No NODE_ENV environment variable set.");
  logger.end();
}
export const NODE_ENV: string = node_env as string;
const prod = NODE_ENV === "prod"; // Anything else is treated as 'dev'

export const PORT: string = process.env.PORT || "8080";
let dburi: string | undefined = process.env.DBURI;
if (!dburi) {
  logger.error("No mongo connection string. Set DBURI environment variable.");
  logger.end();
}
export const DBURI: string = dburi as string;

let access_token_secret: string | undefined = process.env.ACCESS_TOKEN_SECRET;
if (!access_token_secret) {
  logger.error("No client secret. Set ACCESS_TOKEN_SECRET environment variable.");
  logger.end();
}
export const ACCESS_TOKEN_SECRET: string = access_token_secret as string;

let twilio_auth_token: string | undefined = process.env.TWILIO_AUTH_TOKEN;
let twilio_account_sid: string | undefined = process.env.TWILIO_ACCOUNT_SID;
let twilio_phone_number: string | undefined = process.env.TWILIO_PHONE_NUMBER;
if (!twilio_auth_token || !twilio_account_sid || !twilio_phone_number) {
  logger.error(
    "Missing one or more twilio credentials. Set TWILIO_AUTH_TOKEN, TWILIO_ACCOUNT_SID, and TWILIO_PHONE_NUMBER environment variables."
  );
  logger.end();
}
export const TWILIO_AUTH_TOKEN = twilio_auth_token as string;
export const TWILIO_ACCOUNT_SID = twilio_account_sid as string;
export const TWILIO_PHONE_NUMBER = twilio_phone_number as string;

let oauth_client_id: string | undefined = process.env.OAUTH_CLIENT_ID;
if (!oauth_client_id) {
  logger.error("No OAuth client ID. Set OAUTH_CLIENT_ID environment variable.");
  logger.end();
}
export const OAUTH_CLIENT_ID: string = oauth_client_id as string;
