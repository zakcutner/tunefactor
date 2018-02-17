const Database = require("better-sqlite3"),
      db       = new Database("tokens.db");

function getTokens(username) {
  const query = db.prepare(`SELECT access_token, refresh_token FROM tokens WHERE username='${username}'`);

  return query.get();
}

function addUser(username, access_token, refresh_token) {
  const query = db.prepare(`INSERT INTO tokens (username, access_token, refresh_token) VALUES ('${username}', '${access_token}', '${refresh_token}')`);
  
  return query.run();
}

function updateAccessToken(username, access_token) {
  const query = db.prepare(`UPDATE tokens SET access_token='${access_token}' WHERE username='${username}'`);

  return query.run();
}

function createTable() {
  const query = db.prepare(`CREATE TABLE tokens (username TEXT, access_token TEXT, refresh_token TEXT);`);

  return query.run();
}

module.exports = {getTokens: getTokens, addUser: addUser, updateAccessToken: updateAccessToken, createTable: createTable};
