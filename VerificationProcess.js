class VerificationProcess {
  constructor(songs) {
    this.songs        = songs;
    this.currentSongs = [];
    this.one          = "";
    this.two          = "";
    this.three        = "";
    this.four         = "";
    this.score        = 0;
    this.attempt      = 0;
  }

  static extractSongData(song) {
    return {
             id:         song.id,
             name:       song.name.replace(/\s?\(.+?\)\s?/g, " ").trim(),
             previewURL: song.preview_url,
             coverArt:   song.album.images.reduce((smallest, next) => smallest.height > next.height ? next : smallest).url,
             artists:    song.artists.map(a => a.name).reduce((ns, n) => `${ns}, ${n}`)
           };
  }

  static shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  getSongs() {
    const groupSize = Math.floor(this.songs.length / 4);

    this.currentSongs[0] = this.songs[Math.floor(groupSize * Math.random())];
    this.currentSongs[1] = this.songs[Math.floor(groupSize * Math.random()) + groupSize];
    this.currentSongs[2] = this.songs[Math.floor(groupSize * Math.random()) + (groupSize * 2)];
    this.currentSongs[3] = this.songs[Math.floor(groupSize * Math.random()) + (groupSize * 3)];

    this.one   = this.currentSongs[0].id;  // spotify ID for the track
    this.two   = this.currentSongs[1].id;
    this.three = this.currentSongs[2].id;
    this.four  = this.currentSongs[3].id;

    console.dir(this.currentSongs.map(s => s.name));

    return VerificationProcess.shuffle(this.currentSongs.map(VerificationProcess.extractSongData));
  }

  updateScore(orderedSongs) {
    // returns -1 < n < 1
    //  where n > 0.5 means the user is verified

    this.attempt++;

    const roundScore = this.getRoundScore(orderedSongs);
    const multiplier = 1; //((roundScore < 0) ? 1.3 : 0.7) ** (this.attempt - 1);

    this.score += roundScore * multiplier;

    return this.score;
  }

  getRoundScore(orderedSongs) {
    // returns a score for the round
    // 0   = half correct
    // +ve = mostly correct
    // -ve = mostly wrong

    return VerificationProcess.map[this.getOrders(orderedSongs).join("")];
  }

  getOrders(orderedSongs) {
    return orderedSongs.map(orderedSong => this.getOrder(orderedSong));
  }

  getOrder(orderedSong) {
    switch (orderedSong) {
      case this.one:
        return 1;
      case this.two:
        return 2;
      case this.three:
        return 3;
      case this.four:
        return 4;
      default:
        console.error('Invalid number: ' + orderedSong);
    }
  }
}

VerificationProcess.map = {
  "1234": +0.40, // v v good
  "1243": +0.25, // v good
  "1324": +0.40, // v v good
  "1342": +0.10, // good
  "1423": +0.10, // good
  "1432": -0.25, // v bad
  "2134": +0.25, // v good
  "2143": +0.10, // good
  "2314": +0.10, // good
  "2341": +0.10, // good
  "2413": -0.25, // v bad
  "2431": -0.10, // bad
  "3214": -0.10, // bad
  "3241": -0.10, // bad
  "3124": +0.25, // v good
  "3142": +0.10, // good
  "3421": -0.25, // v bad
  "3412": -0.10, // bad
  "4231": -0.40, // v v bad
  "4213": -0.10, // bad
  "4321": -0.40, // v v bad
  "4312": -0.25, // v bad
  "4123": +0.25, // v good
  "4132": -0.10  // bad
};

module.exports = VerificationProcess;

