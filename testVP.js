const fs = require('fs'),
      VP = require("./VerificationProcess.js"),
      obj = JSON.parse(fs.readFileSync('testdata.json', 'utf8'));

let vp = new VP(obj.items);
console.log(vp.getSongs());
console.log(vp.currentSongs.map(s => s.name));
console.log(vp.currentSongs.map(s => s.preview_url));
