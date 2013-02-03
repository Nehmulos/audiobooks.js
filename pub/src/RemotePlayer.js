function RemotePlayer() {
    Player.prototype.constructor.call(this, "RemotePlayer");
    
    this.fetchPlayStatus();
    
    var _this = this;
    this.progressUpdater = function() {
        if (_this.status == "playing") {
            if (_this.progress.current >= _this.progress.length) {
                //_this.fetchProgress();
                _this.fetchPlayStatus();
            } else {
                _this.progress.current += 1;
                _this.setProgress(_this.progress);
            }
        }
    }
    window.setInterval(this.progressUpdater, 1000);
    
    $(".tool.toggleSpeakersButton").attr("src", "img/headsetIcon.png");
}
RemotePlayer.prototype = new Player();

RemotePlayer.prototype.fetchProgress = function() {
    var _this = this;
    $.getJSON("api/getProgress", function(data) {
        Player.prototype.setProgress.call(_this, data.progress);
    });
}

RemotePlayer.prototype.fetchPlayStatus = function() {
    var _this = this;
    $.getJSON("api/getPlayStatus", function(data) {
        Player.prototype.setTrack.call(_this, data.track);
        Player.prototype.setProgress.call(_this, data.progress);
        Player.prototype.setTrackList.call(_this, data.trackList);
        _this.setStatus(data.paused ? "paused" : "playing");
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
    var _this = this;
    Player.prototype.continuePlaying.call(this);
    $.getJSON("api/unPause", function(data) {
        console.log(data);
        if (data && !data.error) {
            _this.setStatus("playing");
        }
    });
}

RemotePlayer.prototype.pause = function(callback) {
    var _this = this;
    Player.prototype.pause.call(this);
    $.getJSON("api/pause", function(data) {
        console.log(data);
        
        if (data && !data.error) {
            _this.setStatus("paused");
        }
        
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
            console.log("progress: " + data.progress);
        } else {
            console.error(error);
        }
    });
}
