import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import * as env from "./util/secrets.js";
import logger from "./util/logger.js";
import mongoose from "mongoose";
import routes from "./routes/routes.js";
import sms_routes from "./routes/sms_routes.js";
import useragent from "express-useragent";

const app = express();

// run checker in background
import "./checker/checker.js";

mongoose.set("strictQuery", true); //https://mongoosejs.com/docs/guide.html#strictQuery
await mongoose.connect(env.DBURI);
await app.listen(env.PORT); // listen for requests
logger.info(`Server running on port ${env.PORT}`);

/* =============================== Middleware =============================== */

// register view engine
app.set("view engine", "ejs");
// show incoming requests in console (dev mode only)
if (env.NODE_ENV === "dev") app.use(morgan("dev"));
// sets public folder (css, images, browser/client js, etc.)
app.use(express.static("./views/public"));
// used to parse JSON bodies and replaces deprecated body-parser
app.use(express.json());
// allows url encoding
app.use(express.urlencoded({ extended: true }));
// allow cookie reading and parsing
app.use(cookieParser());
// block cross-origin requests for security
app.use(cors());
// Add req.userAgent to all requests (to know if on mobile or not for EJS rendering)
app.use(useragent.express());
/* ========================================================================== */

app.use("/sms-reply", sms_routes);
// passes all other requests to router.
app.use("", routes);
