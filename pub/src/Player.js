function Player(typeName) {
    this.typeName = typeName;
    this.track = null;
    this.trackList = [];
    this.status = "paused";
    this.progress = null;
}

Player.prototype.transfereFromPlayer = function(player) {
    //this.play(player.track, player.progress.current);
    //this.setTrackList(player.trackList);
    this.setTrackList([player.track].concat(player.trackList));
    this.play();
//    if (player.status == "paused") {
//        this.pause();
//    }
}

Player.prototype.setTrack = function(url) {
    this.track = url;
}

Player.prototype.setTrackList = function(trackList) {
    this.trackList = trackList;
}

Player.prototype.playList = function(list) {
    this.stop();
    this.setTrackList(list);
    this.play();
}

Player.prototype.play = function(url, startTime) {
    if (url != undefined) {
        this.setTrack(url, startTime);
        if (url != null) {
            this.continuePlaying();
        }
    } else if (this.track) {
        this.continuePlaying();
    } else {
        this.playNextTrack();
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
        var track = this.trackList[0];
        this.trackList.splice(0,1);
        this.play(track);
    }
}

Player.prototype.pause = function() {
    this.updateProgress();
}

Player.prototype.updateProgress = function() {
    
}

