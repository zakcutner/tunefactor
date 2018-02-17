var express = require('express');
var request = require('request');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var key = require('./spotify.key');
var client_id = key.CLIENT_ID;
var client_secret = key.CLIENT_SECRET;
var redirect_uri = 'http://localhost:8888/callback';

const db = require('./db.js');
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/', function(req, res) {
  //render homepage.
})

//function call to initiate signing into spotify.
function authenticateWithSpotify(httpResponse, callbackURL) {

  var state = generateRandomString(16);
  httpResponse.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';

  httpResponse.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true
    }));

}

app.get('/signup', function(req, res) {

  authenticateWithSpotify(res, redirect_uri);

});

function getTracks(username, callback) {

  db.createTable();
  var tokens = db.getTokens(username);

  var access_token = tokens.access_token;
  var refresh_token = tokens.refresh_token;

  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  // use the access token to access the Spotify Web API
  request.get(options, function(error, response, body) {

    if (body.hasOwnProperty('error')) {

      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var access_token = body.access_token;
          db.updateAccessToken(username, access_token);
          getTracks(username, callback);
        } else {
          callback(body);
        }
      });

      return;
    }

    callback(body);
  });
}

module.exports.getTracks = getTracks;

app.get('/login', function(req, res) {

  getTracks(username, function(body) {
    console.log("getTracks callback!");
    console.log(JSON.stringify(body));
  });

});

app.get('/callback', function(req, res) {

  //username has to be stored in a cookie and retrieved here.

  console.log('callback received!');

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {

    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        db.createTable();
        db.addUser("matthewyeo", access_token, refresh_token);

        //redirect to login.

      } else {

        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));

      }
    });
  }
});

console.log('Listening on 8888');
app.listen(8888);
