// Description: Logger for the application
import moment from "moment";
import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import dotenv from "dotenv";
dotenv.config();

// must use process.env.NODE_ENV instead of env.NODE_ENV because this file is imported before env is set
const NODE_ENV: string = process.env.NODE_ENV || "dev";
const directory: string = "./logs/";

const levels_and_colors = {
  levels: {
    error: 0,
    debug: 1,
    info: 2,
  },
  colors: {
    error: "red",
    debug: "green",
    info: "blue",
  },
};

let options = {
  levels: levels_and_colors.levels,
  format: winston.format.printf(
    (info) => `[${info.level}] ${moment().format("YYYY-MM-DD hh:mm:ss").trim()}: ${info.message}`
  ),
  transports: [
    new DailyRotateFile({
      filename: "debug-%DATE%.log",
      datePattern: "MM-DD-YYYY",
      maxFiles: "7d",
      dirname: directory,
      auditFile: directory + "/audits/debug-audit.json",
      level: "debug",
    }),
    new DailyRotateFile({
      filename: "error-%DATE%.log",
      datePattern: "MM-DD-YYYY",
      maxFiles: "7d",
      dirname: directory,
      auditFile: directory + "audits/error-audit.json",
      level: "error",
    }),
  ],
};

const logger = winston.createLogger(options);
winston.addColors(levels_and_colors.colors);

if (NODE_ENV == "dev") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `[${info.level}] ${moment().format("YYYY-MM-DD hh:mm:ss").trim()}: ${info.message}`
        )
      ),
    })
  );

  logger.add(
    new DailyRotateFile({
      filename: "info-%DATE%.log",
      datePattern: "MM-DD-YYYY",
      maxFiles: "7d",
      dirname: directory,
      auditFile: directory + "audits/info-audit.json",
      level: "info",
    })
  );
}

// https://www.npmjs.com/package/winston#awaiting-logs-to-be-written-in-winston
logger.on("finish", function (info) {
  process.exit(0);
});

export default logger;
