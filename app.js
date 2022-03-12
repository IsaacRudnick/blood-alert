const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const routes = require("./routes/routes.js");
const sms_routes = require("./routes/sms_routes.js");
const app = express();

// run checker in background
require("./checker/checker");

// connect to mongodb & listen for requests
const dbURI = process.env.DBURI;
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(process.env.PORT || 8080)) // listen for requests
  .catch((err) => console.log(err)); // log any errors

/* =============================== Middleware =============================== */

// register view engine
app.set("view engine", "ejs");
// show incoming requests in console.
app.use(logger("dev"));
// sets public folder (css, images, browser/client js, etc.)
app.use(express.static("public"));
// used to parse JSON bodies and replaces deprecated body-parser
app.use(express.json());
// allows url encoding
app.use(express.urlencoded({ extended: true }));
// allow cookie reading
app.use(cookieParser());

/* ========================================================================== */

//For form validation, returns validator.js
app.use("/validator.min.js", express.static(__dirname + "/node_modules/validator/validator.min.js"));
app.use("/reply", sms_routes);

// passes all other requests to router.
app.use("", routes);
