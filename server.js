const express = require("express"),
      app     = express(),
      port    = 3000;

app.get("/api", (req, res) => {
  res.send("hello!");
});

app.listen(port, () => console.log(`Running on port ${port}.`));

