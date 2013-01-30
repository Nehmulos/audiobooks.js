function WebPlayer() {
    Player.prototype.constructor.call(this, "WebPlayer");
}
WebPlayer.prototype = new Player();

WebPlayer.prototype.setTrack = function(url) {
    Player.prototype.setTrack.call(this, url);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.src = url + "?stream";
    this.progress = {current: 0, length: audioElement.duration};
}

WebPlayer.prototype.continuePlaying = function() {
    Player.prototype.continuePlaying.call(this);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.play();
}

WebPlayer.prototype.pause = function() {
    Player.prototype.pause.call(this);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.pause();
}

WebPlayer.prototype.stop = function() {
    var audioElement = $("#audioPlayer").get(0);
    audioElement.pause();
    audioElement.src = "";
}

WebPlayer.prototype.jumpTo = function(secTime) {
    var audioElement = $("#audioPlayer").get(0);
    audioElement.currentTime = secTime;
}
