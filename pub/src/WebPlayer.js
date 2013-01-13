function WebPlayer() {
    Player.prototype.constructor.call(this, "WebPlayer");
}
WebPlayer.prototype = new Player();

WebPlayer.prototype.setTrack = function(url) {
    Player.prototype.setTrack.call(this, url);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.src = url + "?stream";
}

WebPlayer.prototype.continuePlaying = function() {
    Player.prototype.continuePlaying.call(this);
    audioElement.play();
}

WebPlayer.prototype.pause = function() {
    Player.prototype.pause.call(this);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.pause();
}
