const VerificationProcess = require("./VerificationProcess.js"),
      thresholdScore      = 0.5,
      failScore           = -0.5;
      maxGuesses          = 4,
      vps                 = {},
      getTracks           = require("./api.js").getTracks;

module.exports = function(app) {
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

    if (newScore <= failScore) mode = "fail";

    if (newScore >= thresholdScore && mode === "hold") mode = "pass";

    let ret = { mode: mode };

    if (mode === "hold") ret.songs = vps[username].getSongs();

    res.json(ret);
  });
}

