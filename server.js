const express             = require("express"),
      bodyParser          = require("body-parser"),
      VerificationProcess = require("./VerificationProcess.js"),
      app                 = express(),
      port                = 3000,
      thresholdScore      = 0.5,
      maxGuesses          = 4,
      tempObj             = JSON.parse(require("fs").readFileSync("testdata.json", "utf-8")),
      vps                 = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/api/initial_song", (req, res) => {
  const username = req.body.username || "";

  let firstSong = (obj) => {
    vps[username] = new VerificationProcess(obj.items);

    res.json(vps[username].getSongs());
  }

  firstSong(tempObj);
});

app.post("/api/authenticate", (req, res) => {
  const username = req.body.username,
        guess    = req.body.order,
        newScore = vps[username].updateScore(guess);

  console.dir(username);
  console.dir(guess);

  let mode = vps[username].attempt >= maxGuesses ? "fail" : "hold";

  if (newScore >= thresholdScore && mode === "hold") mode = "pass";

  let ret = { mode: mode };

  if (mode === "hold") ret.songs = vps[username].getSongs();

  res.json(ret);
});

app.listen(port, () => console.log(`Running on port ${port}.`));

