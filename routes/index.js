
var express = require('express');
var passport = require('passport');
var User = require('../models/users');
var router = express.Router();


router.get('/', function (req, res) {
  res.render('login', { user : req.user });
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.post('/register', function(req, res) {
  User.register(new User({ username : req.body.username }), req.body.password, function(err, User) {
    if (err) {
        return res.render('register', { User : User });
    }
    passport.authenticate('local')(req, res, function () {
        res.redirect('/');
    });
  });
});

router.get('/login', function(req, res) {
  console.log(User.find({}));
  res.render('login', { user : req.user });
});


router.post('/login', passport.authenticate('local'), function(req, res) {
  console.log(req.body);
  res.render('layout', {message: req.flash("Welcome!")});
});

// router.post('/login',
//   passport.authenticate('local', {
//   successRedirect: 'index',
//   successFlash: "Welcome!",
//   failureRedirect: "login.html",
//   failureFlash: "Invalid username or password"
// }));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('login.html');
});

router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});

module.exports = router;
