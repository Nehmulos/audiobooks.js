function RemotePlayer() {
    Player.prototype.constructor.call(this, "RemotePlayer");
}
RemotePlayer.prototype = new Player();

RemotePlayer.prototype.stop = function(callback) {
    
    var gotJson = function(data) {
        console.log(data);
        this.mplayerInstanceExists = false;
        if (callback) {
            callback();
        }
    };

    $.getJSON("api/stop", gotJson).error(gotJson);
}

// TODO use startTime for mplayer -ss $starttime option
// TODO deprecated use setTrackList
RemotePlayer.prototype.setTrack = function(url, startTime) {
    Player.prototype.setTrack.call(this);
    //this.setTrackList([url]);
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

RemotePlayer.prototype.pause = function() {
    Player.prototype.pause.call(this);
    $.getJSON("api/togglePause", function(data) {
        console.log(data);
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
