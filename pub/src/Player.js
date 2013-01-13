function Player(typeName) {
    this.typeName = typeName;
    this.track = null;
    this.status = "paused";
    this.progress = null;
}

Player.prototype.transfereFromPlayer = function(player) {
    this.play(player.track);
    this.jumpTo(player.progress.current)
    
}

Player.prototype.play = function(url) {
    if (url != undefined) {
        this.track = url;
        this.stop();
        if (url != null) {
            this.continuePlaying();
        }
    } else {
        this.continuePlaying();
    }
}

Player.prototype.stop = function(url) {
    
}

Player.prototype.continuePlaying = function() {

}

Player.prototype.pause = function() {
    this.updateProgress();
}

Player.prototype.updateProgress = function() {
    
}

