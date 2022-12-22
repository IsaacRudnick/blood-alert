import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import mongoose from "mongoose";
mongoose.set("strictQuery", true); //https://mongoosejs.com/docs/guide.html#strictQuery
import dotenv from "dotenv";
dotenv.config();
import routes from "./routes/routes.js";
import sms_routes from "./routes/sms_routes.js";

const app = express();

// run checker in background
import "./checker/checker.js";

const dbURI = process.env.DBURI;
await mongoose.connect(dbURI);
await app.listen(process.env.PORT || 8080); // listen for requests

/* =============================== Middleware =============================== */
// register view engine
app.set("view engine", "ejs");
// show incoming requests in console (dev mode only)
if (process.env.mode == "dev") app.use(logger("dev"));
// sets public folder (css, images, browser/client js, etc.)
app.use(express.static("public"));
// used to parse JSON bodies and replaces deprecated body-parser
app.use(express.json());
// allows url encoding
app.use(express.urlencoded({ extended: true }));
// allow cookie reading
app.use(cookieParser());
// block cross-origin requests
app.use(cors());
/* ========================================================================== */

app.use("/sms-reply", sms_routes);
// passes all other requests to router.
app.use("", routes);