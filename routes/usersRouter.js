var express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

const users = require('../models/users');

var router = express.Router();
router.use(bodyParser.json());


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.route('/')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  next();
})
.get((req, res, next) => {
  users.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
  // res.end('Sending User Information...');
})
.post((req, res, next) => {
  console.log(req.body);
  users.create(req.body)
  .then((user) => {
    console.log("User created ", user);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }, (err) => next(err))
  .catch((err) => next(err));
  // res.end('Adding user ' + req.body.name + 'with details: ' +
  //         req.body.description);
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /users');
})
.delete((req, res, next) => {
  users.remove({})
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
  // res.end('Deleting all users');
});

router.route('/:userId')
.get((req, res, next) => {
  users.findById(req.params.userId)
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(user);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post((req, res, next) => {
  res.statusCode = 403;
  res.end('POST operation not supported on /users/' + req.params.userId);
})
.put((req, res, next) => {
  users.findByIdAndUpdate(req.params.userId)
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
})
.delete((req, res, next) => {
  users.findByIdAndDelete(req.params.userId)
  .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
})

router.post('/signup', (req, res, next) => {
  User.register(new User(req.body)), req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err:err});
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: "Registration Complete!"});
          res.render();
        })
      }
    }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: "Login Successful!"})
  res.render();
})

router.post('/login')
module.exports = router;
