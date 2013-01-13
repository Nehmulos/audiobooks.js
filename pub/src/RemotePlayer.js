function RemotePlayer() {
    Player.prototype.constructor.call(this, "RemotePlayer");
    this.mplayerInstanceExists = false;
}
RemotePlayer.prototype = new Player();

Player.prototype.stop = function(url) {
    $.getJSON("api/stop", function(data) {
        console.log(data);
        this.mplayerInstanceExists = false;
    });
}

Player.prototype.continuePlaying = function() {
    if (!this.mplayerInstanceExists) {
        $.getJSON("api/play?" + url, function(data) {
            console.log(data);
            this.mplayerInstanceExists = true;
        });
    } else {
        $.getJSON("api/unPause", function(data) {
            console.log(data);
        });
    }
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
