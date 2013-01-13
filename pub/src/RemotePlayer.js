function RemotePlayer() {
    Player.prototype.constructor.call(this, "RemotePlayer");
}
RemotePlayer.prototype = new Player();

Player.prototype.stop = function() {
    $.getJSON("api/stop", function(data) {
        console.log(data);
        this.mplayerInstanceExists = false;
    });
}

RemotePlayer.prototype.setTrack = function(url) {
    Player.prototype.setTrack.call(this);
    $.getJSON("api/play?" + url, function(data) {
        console.log(data);
    });
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
