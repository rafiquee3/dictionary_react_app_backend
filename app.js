const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const { connect } = require('./client');
const config = require('./config');
const createError = require('http-errors');
const logger = require('morgan');

const dictionaryRouter = require('./routes/dictionary');
const usersRouter = require('./routes/users');

const app = express();

app.set('x-powered-by', false);

app.use(logger('dev'));
// error handler 
/* app.use(function (req, res, next) {
    next(createError(404))
  }) */
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser());
app.use(cookieSession({
    name: 'session',
    keys: config.keySession, 
    maxAge: config.maxAgeSession 
  }))
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', dictionaryRouter);
app.use('/users', usersRouter);


//connect();

module.exports.application = app ;
