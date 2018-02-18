const express             = require("express"),
      bodyParser          = require("body-parser"),
      VerificationProcess = require("./VerificationProcess.js"),
      app                 = express(),
      port                = 3000,
      thresholdScore      = 0.5,
      failScore           = -0.5;
      maxGuesses          = 4,
      vps                 = {},
      getTracks           = require("./api.js").getTracks;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("ui"));

// TODO: remove!!!
app.post("/login", (req, res) => res.json({success: true}));

app.post("/api/initial_song", (req, res) => {
  const username = req.body.username || "";

  let firstSong = (obj) => {
    vps[username] = new VerificationProcess(obj.items);

    res.json(vps[username].getSongs());
  }

  getTracks(username,firstSong);

});

app.post("/api/authenticate", (req, res) => {
  const username = req.body.username,
        guess    = req.body.order,
        newScore = vps[username].updateScore(guess);

  let mode = vps[username].attempt >= maxGuesses ? "fail" : "hold";

  if (vps[username].attempt <= failScore) mode = "fail";

  if (newScore >= thresholdScore && mode === "hold") mode = "pass";

  let ret = { mode: mode };

  if (mode === "hold") ret.songs = vps[username].getSongs();

  res.json(ret);
});

app.listen(port, () => console.log(`Running on port ${port}.`));

