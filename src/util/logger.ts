// Description: Logger for the application
import moment from "moment";
import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";
dotenv.config();
// There are three levels of logging: error, info, and debug

// - error: only logs errors, such as:
// -- errors connecting to the database
// -- missing environment variables

// - info: include info about what the application is doing, such as:
// -- starting the application / server
// -- connecting to the database

// - debug: (only logged in development mode) details such as:
// -- anything specific to a user, e.g. their email
// -- anything specific to a request/response, e.g. the request/response body

// If in production, there is no console logging and only error and info logs are saved to files

// must use process.env.NODE_ENV instead of env.NODE_ENV because this file is imported before env is set
const NODE_ENV: string = process.env.NODE_ENV || "dev";
const directory: string = "./logs/";

const levels_and_colors: any = {
  // Descending order, i.e. lower number = higher priority
  levels: {
    error: 0,
    info: 1,
    debug: 2,
  },
  colors: {
    error: "red",
    info: "blue",
    debug: "yellow",
  },
};

const defaultOutputFormat: winston.Logform.Format = format.combine(
  format.printf((info) => `[${info.level}] ${moment().format("YYYY-MM-DD hh:mm:ss").trim()}: ${info.message}`),
  format.align()
);

interface Idrf {
  error: DailyRotateFile;
  info: DailyRotateFile;
  debug: DailyRotateFile;
}

// Create the daily rotater files
const dailyRotaterFiles: Idrf = {
  error: new DailyRotateFile({
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "3d",
    dirname: directory + "/0 - error",
    auditFile: directory + "audits/error-audit.json",
    level: "error",
  }),
  info: new DailyRotateFile({
    filename: "info-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "3d",
    dirname: directory + "/1 - info",
    auditFile: directory + "/audits/info-audit.json",
    level: "info",
  }),
  // Only used in development mode
  debug: new DailyRotateFile({
    filename: "debug-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    maxFiles: "3d",
    dirname: directory + "/2 - debug",
    auditFile: directory + "audits/debug-audit.json",
    level: "debug",
  }),
};

interface Options {
  levels: any;
  format: winston.Logform.Format;
  transports: winston.transport[];
}

let options: Options = {
  levels: levels_and_colors.levels,
  format: defaultOutputFormat,
  transports: [dailyRotaterFiles.info, dailyRotaterFiles.error],
};

// If in development mode, also log to the console and save debug logs to files
if (NODE_ENV === "dev") {
  // Add the debug file to the transports
  options.transports.push(dailyRotaterFiles.debug);
  // Add the console to the transports
  options.transports.push(
    new winston.transports.Console({
      // lowest priority level to include in the console
      level: "debug",
      format: format.combine(format.colorize({ level: true, colors: levels_and_colors.colors }), defaultOutputFormat),
    })
  );
}

const logger = winston.createLogger(options);

// https://www.npmjs.com/package/winston#awaiting-logs-to-be-written-in-winston
// call this (instead of process.exit(0)) to make sure all logs are written before exiting
logger.on("finish", function (info) {
  process.exit(0);
});

export default logger;
