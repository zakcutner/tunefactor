var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');
var expressValidator = require('express-validator');
var crypto = require('crypto');
var Database = require('better-sqlite3');

// Change the name of the sqlite database
var db = new Database('users5.db');


var app = express();

app.use(passport.initialize());
app.use(passport.session());


// connect.then((db) => {
//   console.log("Connected correctly to server");
// }, (err) => { console.log(err); });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ui')));
app.use(expressValidator())

var LocalStrategy = require('passport-local').Strategy;
// app.use('/', routes);

// passport config

passport.serializeUser(function(user, done) {
  return done(null, user);
});

passport.deserializeUser(function(id, done) {
  var row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);''
  if (!row) return done(null, false);
  return done(null, row);
});

// Get Landing Page Route
// ----------------------
app.get('/', function (req, res) {
  res.sendfile('ui/login.html');
});

// Get Login Page Route
//----------------------
app.get('/login', function(req, res) {
  res.sendfile('ui/login.html');
});


// Login Route
//-------------
function hashPassword(password, salt) {
  var hash = crypto.createHash('sha256');
  hash.update(password)
  hash.update(salt);
  return hash.digest('hex');
}

passport.use(new LocalStrategy(function(username, password, done) {
  // console.log(db.prepare('SELECT * FROM users').get());
  // console.log(db.prepare('SELECT salt FROM users WHERE username= "duhdoy"').get());
  // console.log(username);
  // console.log(password);
  // console.log('"'+ username + '"');
  var row = db.prepare(`SELECT salt FROM users WHERE username ='${username}'`).get();
  // console.log(row);
  if (!row) {
    // console.log("Cannot find row here!");
    return done(null, false);
  }
  var hash = hashPassword(password, row.salt);
  var row = db.prepare(`SELECT username FROM users WHERE username = '${username}' AND password = '${hash}'`).get();
  // console.log(row);
  // console.log(hash);
  // console.log(row.username);
  if (!row) {
    // console.log("Cannot find row");
    return done(null, false);
  }
  return done(null, row);
}));



app.get('/successjson', function(req, res) {
  res.json({success:true});
});

app.get('/failurejson', function(req, res) {
  res.json({success:false});
});

app.post('/login',
  passport.authenticate('local', {
  successRedirect: 'successjson',
  failureRedirect: "failurejson",
}));

// Registration Route
// ---------------------
app.post('/register', function(req,res) {
  var emailinput = req.body.email;
  var usernameinput = req.body.username;
  var passwordinput = req.body.password;
  var password2input = req.body.password2;

  req.checkBody("username", 'Username is required').notEmpty();
  req.checkBody("email", 'Email is required').notEmpty();
  req.checkBody("email", 'Email is not valid').isEmail();
  req.checkBody("password", 'Password is required').notEmpty();
  req.checkBody("password", 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  var saltinput = crypto.randomBytes(16);
  var hashpass = hashPassword(passwordinput, saltinput);


  if (errors){
    console.log(errors);
    res.json({ success: false, message: errors });
  } else {
    //Insert into database user information
    var stmt = db.prepare("INSERT INTO users VALUES (@username, @password, @salt, @email)");
    stmt.run({username: usernameinput,
              email: emailinput,
              salt: saltinput,
              password: hashpass});
    // res.redirect('/');
    res.json({ success: true });
  }
});


// Logout Route
//-------------

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('login.html');
});

//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
/* app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
}); */

app.listen(3000);

module.exports = app;
