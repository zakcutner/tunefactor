class VerificationProcess {
  constructor(songs) {
    this.songs        = songs;
    this.currentSongs = [];
    this.one          = "";
    this.two          = "";
    this.three        = "";
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

  getSongs() {
    const groupSize = Math.floor(this.songs.length / 3);

    this.currentSongs[0] = this.songs[Math.floor(groupSize * Math.random())];
    this.currentSongs[1] = this.songs[Math.floor(groupSize * Math.random()) + groupSize];
    this.currentSongs[2] = this.songs[Math.floor(groupSize * Math.random()) + (groupSize * 2)];
    
    this.one   = this.currentSongs[0].id;  // spotify ID for the track
    this.two   = this.currentSongs[1].id;
    this.three = this.currentSongs[2].id;

    return this.currentSongs.map(VerificationProcess.extractSongData);
  }

  updateScore(orderedSongs) {
    // returns -1 < n < 1 
    //  where n > 0.5 means the user is verified

    this.attempt++;

    const roundScore = this.getRoundScore(orderedSongs);
    const multiplier = ((roundScore < 0) ? 1.3 : 0.7) ** this.attempt;
    
    this.score += roundScore * multiplier;

    return this.score;
  }

  getRoundScore(orderedSongs) {
    // returns a score for the round
    // 0   = half correct
    // +ve = mostly correct
    // -ve = mostly wrong
    
    if (orderedSongs[0] == this.one) {  // case 1 or 3
      if (orderedSongs[1] == this.two) return 0.6;  // case 1
      
      return 0.3;  // case 3;
    }
    
    if (orderedSongs[1] == this.one) {  // case 4 or 6
      if (orderedSongs[0] == this.two) return 0.2;  // case 4

      return 0.1;  // case 6
    }
    
    if (orderedSongs[0] == this.two) return -0.1;  // case 5

    return -0.3;  // case 2
  }

}

module.exports = VerificationProcess;


