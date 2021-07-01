const express = require('express');
const cookieParser = require('cookie-parser')
const logger = require('morgan');
const mongoose = require('mongoose');
const csrf = require('csurf');

require('dotenv').config();
const routes = require('./routes/routes.js');


const app = express();
const csrfMiddleWare = csrf({ cookie: true })

// connect to mongodb & listen for requests
const dbURI = process.env.DBURI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(result => app.listen(3000))
    .catch(err => console.log(err));
// register view engine
app.set('view engine', 'ejs');
// show incoming requests in console.
app.use(logger('dev'));
// sets public folder (css, images, browser/client js, etc.)
app.use(express.static('public'));
// used to parse JSON bodies and replaces deprecated body-parser
app.use(express.json());
// allows url encoding
app.use(express.urlencoded({ extended: true }));
// able to read cookies
app.use(cookieParser());
// include CSRF middleware
app.use(csrfMiddleWare);

// Takes any requests and creates a cookie with csrf cookie
app.all('*', (req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    // passes to next middleware
    next();
});

// passes all requests to router.
app.use('', routes);