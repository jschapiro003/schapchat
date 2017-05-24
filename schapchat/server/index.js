const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Session = require('express-session');

const app = express();
const router = express.Router();
const port = process.env.API_PORT || 3001;

const {dbUser, dbPassword, dbUrl} = require('../config/database');
const {web} = require('../config/youtube');
const {client_id, project_id, auth_uri, token_uri, client_secret} = web;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const DB_CONNECTION_URL = `mongodb://${dbUser}:${dbPassword}${dbUrl}`;

mongoose.connect(DB_CONNECTION_URL, (err) => {
	if (err) {
		return console.error(new Error('A problem occured while connecting to database!'));
	}
	return console.log('Succesfully connected to database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
 res.setHeader('Cache-Control', 'no-cache');
 next();
});

app.use(Session({ secret: 'keyboard cat' }));
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: "http://localhost:3001/api/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       console.log('loc1 ', accessToken)
       console.log('loc2 ', refreshToken)
       console.log('loc3 ', profile);
       return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

router.get('/', function(req, res) {
  console.log('success')
 res.json({ message: 'API Initialized!'});
});

router.get('/login', function(req, res) {
  console.log('fail');
  res.json({ message: 'Failure! '});
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/youtube'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000/success',
    failureRedirect: 'http://localhost:3000/error'
  }));


app.use('/api', router);

app.listen(port, function() {
 console.log(`Prankin' on ${port}`);
});