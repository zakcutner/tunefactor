var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var passport = require('passport');
var expressSession = require('express-session');
var usersRouter = require('./routes/usersRouter');

var index = require('./routes/index');
var usersRouter = require('./routes/usersRouter');
var flash = require('connect-flash');


var app = express();
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());




const url = 'mongodb://localhost:27017/tuna';
const connect = mongoose.connect(url, {
    useMongoClient: true,
  });

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var LocalStrategy = require('passport-local').Strategy;
var routes = require('./routes/index');
var users = require('./models/users');
app.use('/', routes);

// passport config
passport.use(new LocalStrategy(users.authenticate()));
passport.serializeUser(users.serializeUser());
passport.deserializeUser(users.deserializeUser());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
