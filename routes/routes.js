const express = require('express');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const controller = require('../controllers/controller');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '931638414558-j7n73fhlap5mo2euigehbuguo40vka0j.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);


const router = express.Router();

function checkAuthenticated(req, res, next) {

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend 
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
        .then(() => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log("User not logged in, redirecting");
            res.redirect('/login')
        })

}

// GET requests
router.get('/', controller.index_get);
router.get('/login', controller.login_get);
router.get('/signin', controller.signin_get);
router.get('/logout', controller.logout_get);

router.get('/profile', checkAuthenticated, controller.profile_get);


// POST requests
router.post('/login', controller.login_post);

//404 (Final route)
router.use((req, res) => { res.status(404).render('404', { title: '404' }); });

module.exports = router;