function RemotePlayer() {
    Player.prototype.constructor.call(this, "RemotePlayer");
    
    this.fetchPlayStatus();
}
RemotePlayer.prototype = new Player();

RemotePlayer.prototype.fetchPlayStatus = function() {
    var _this = this;
    $.getJSON("api/getPlayStatus", function(data) {
        Player.prototype.setTrack.call(_this, data.track);
        Player.prototype.setProgress.call(_this, data.progress);
        Player.prototype.setTrackList.call(_this, data.trackList);
        _this.paused = data.paused;
    });
}

RemotePlayer.prototype.stop = function(callback) {
    
    var gotJson = function(data) {
        this.mplayerInstanceExists = false;
        if (callback) {
            callback();
        }
    };

    $.getJSON("api/stop", gotJson).error(gotJson);
}

RemotePlayer.prototype.setTrackList = function(url, callback) {
    Player.prototype.setTrackList.call(this, url);
    var args = {trackList: url};
    console.log(JSON.stringify(args));
    
    var gotJson = function(data) {
        console.log(data);
        if (callback) {
            callback();
        }
    };
    
    $.getJSON("api/setTrackList?" + JSON.stringify(args), gotJson)
        .error(gotJson);
}

RemotePlayer.prototype.continuePlaying = function() {
    Player.prototype.continuePlaying.call(this);
    $.getJSON("api/unPause", function(data) {
        console.log(data);
    });
}

RemotePlayer.prototype.pause = function(callback) {
    Player.prototype.pause.call(this);
    $.getJSON("api/pause", function(data) {
        console.log(data);
        if (callback) {
            callback();
        }
    });
}

RemotePlayer.prototype.updateProgress = function() {
    var _this = this;
    $.getJSON("api/getProgress", function(data) {
        if (!data.error) {
            _this.progress = data.progress;
            console.log("progres: " + data.progress);
        } else {
            console.error(error);
        }
    });
}
