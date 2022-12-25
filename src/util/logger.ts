// Description: Logger for the application
import winston from "winston";

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      // must use process.env.NODE_ENV instead of env.NODE_ENV because this file is imported before env is set
      level: process.env.NODE_ENV === "prod" ? "error" : "debug",
    }),
    new winston.transports.File({ filename: "debug.log", level: "debug" }),
  ],
};

const logger = winston.createLogger(options);

if (process.env.NODE_ENV !== "prod") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
