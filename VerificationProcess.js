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
    
    return VerificationProcess.map.get(getOrders(orderedSongs));
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

VerificationProcess.map = new Map([
  [[1, 2, 3, 4], +0.5],
  [[1, 2, 4, 3], +0.3], // good
  [[1, 3, 2, 4], +0.3], // good
  [[1, 3, 4, 2], +0.1], // good
  [[1, 4, 2, 3], +0.1], // good
  [[1, 4, 3, 2], -0.3], // bad
  [[2, 1, 3, 4], +0.3], // good
  [[2, 1, 4, 3], +0.1], // good
  [[2, 3, 1, 4], +0.1], // good
  [[2, 3, 4, 1], +0.1], // good
  [[2, 4, 1, 3], -0.1], // bad
  [[2, 4, 3, 1], -0.1], // bad
  [[3, 2, 1, 4], -0.1], // bad
  [[3, 2, 4, 1], -0.1], // bad
  [[3, 1, 2, 4], +0.1], // good
  [[3, 1, 4, 2], +0.1], // good
  [[3, 4, 2, 1], -0.3], // bad
  [[3, 4, 1, 2], -0.1], // bad
  [[4, 2, 3, 1], -0.1], // bad
  [[4, 2, 1, 3], -0.3], // bad
  [[4, 3, 2, 1], -0.5],
  [[4, 3, 1, 2], -0.3], // bad
  [[4, 1, 2, 3], +0.3], // good
  [[4, 1, 3, 2], -0.1], // bad
]);

module.exports = VerificationProcess;

