function Player(typeName) {
    this.typeName = typeName;
    this.track = null;
    this.trackList = [];
    this.status = "paused";
    this.progress = null;
}

Player.prototype.transfereFromPlayer = function(player) {
    var tracks;
    if (player.track) {
        tracks = [player.track].concat(player.trackList);
    } else {
        tracks = player.trackList;
    }
    
    if (tracks.length > 0) {
        this.setTrackList(tracks);
        if (player.status == "playing") {
            this.play();
        }
    }
}

Player.prototype.setTrack = function(url) {
    this.track = url;
    if (url) {
        var trackName = url;
        if (/([^\/]+)\..*$/.test(url)) {
            url = /([^\/]+)\..*$/.exec(url)[1];
        }
    }
    $(".nowPlayingText .track").text(url);
}

Player.prototype.setTrackList = function(trackList) {
    this.trackList = trackList;
}

Player.prototype.playList = function(list) {
    var _this = this;
    this.stop(function() {
        _this.setTrackList(list, function() {
            _this.play();
        });
    });
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

Player.prototype.setProgress = function(progress) {
    progress = progress || {current:0, max: 100};
    $(".playerGui .progressBar").attr("value", progress.current);
    $(".playerGui .progressBar").attr("max", progress.length);
}

Player.prototype.stop = function(url) {
    this.setTrack(null);
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

