function Player(typeName) {
    this.typeName = typeName;
    this.track = null;
    this.trackList = [];
    this.status = "paused";
    this.progress = null;
}

Player.prototype.transfereFromPlayer = function(player) {
    this.play(player.track, player.progress.current);
}

Player.prototype.setTrack = function(url) {
    this.track = url;
}

Player.prototype.playList = function(list) {
    this.stop();
    this.trackList = list;
    this.playNextTrack();
}

Player.prototype.play = function(url, startTime) {
    if (url != undefined) {
        this.setTrack(url, startTime);
        if (url != null) {
            this.continuePlaying();
        }
    } else {
        this.continuePlaying();
    }
}

Player.prototype.stop = function(url) {
    this.track = null;
}

Player.prototype.continuePlaying = function() {

}

Player.prototype.onTrackEnded = function() {
    this.playNextTrack();
}

Player.prototype.playNextTrack = function() {
    if (this.trackList.length > 0) {
        this.play(this.trackList[0]);
        this.trackList.splice(0,1);
    }
}

Player.prototype.pause = function() {
    this.updateProgress();
}

Player.prototype.updateProgress = function() {
    
}

