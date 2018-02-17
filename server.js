const express             = require("express"),
      VerificationProcess = require("./VerificationProcess.js"),
      app                 = express(),
      port                = 3000;

app.get("/api/initial_song", (req, res) => {
  const username = req.body.username || throw "No username.";

  res.send("hello!");
});

app.listen(port, () => console.log(`Running on port ${port}.`));

