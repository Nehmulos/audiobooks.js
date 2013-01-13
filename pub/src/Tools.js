function Tools() {
    this.init();
}

Tools.prototype.init = function() {
    var _this = this;
    $(".cleanCacheButton").click(function() { _this.cleanCache(); });
    $(".toggleSpeakersButton").click(function() { _this.togglePlayer(); });
}

Tools.prototype.cleanCache = function() {
    
}

Tools.prototype.togglePlayer = function() {
    var track = app.player.track;
    app.player.pause();
    
    if (app.player.typeName == "WebPlayer") {
        app.player = new RemotePlayer();
    } else {
        app.player = new WebPlayer();
    }
    
    if (track) {
        app.player.play(track)
    }
}
