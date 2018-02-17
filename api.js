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

app.get('/signup', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state,
      show_dialog: true
    }));

});

function getTracks(username) {

  db.createTable();
  var tokens = db.getTokens(username);

  var access_token = tokens.access_token;
  var refresh_token = tokens.refresh_token;

  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
    headers: { 'Authorization': 'Bearer ' + "asdf" },
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
          return getTracks(username);
        } else {
          return body;
        }
      });

    }

    return body;
  });
}

module.exports = {
  getTracks: getTracks
}

app.get('/login', function(req, res) {

  //request should have a username parameter
  //fetch access token and refresh token from database

  //**try accessing user library without having them log in their
  //spotify account again, by fetching access token from database.
  //check if access token has expired. If so, fetch new access token
  //using refresh token.
  db.createTable();
  var tokens = db.getTokens("testuser");

  console.dir(tokens);

  var access_token = tokens.access_token;
  var refresh_token = tokens.refresh_token;

  var options = {
    url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
    headers: { 'Authorization': 'Bearer ' + "asdf" },
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

          db.updateAccessToken(access_token);
          console.log(db.getTokens("testuser").access_token);

        } else {

          console.log('error getting new access token');

        }
      });
    }
    console.log(JSON.stringify(body));
  });


  //make get request to spotify api end point using the access token.

});

app.get('/callback', function(req, res) {

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

        console.log(typeof access_token);
        db.createTable();
        db.addUser("testuser", access_token, refresh_token);

        var options = {
          url: 'https://api.spotify.com/v1/me/top/tracks?limit=50',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(JSON.stringify(body));
          console.log(body.items.length);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
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
      res.send({
        'access_token': access_token
      });
    }
  });
});


console.log('Listening on 8888');
app.listen(8888);
