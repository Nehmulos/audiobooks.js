function WebPlayer() {
    Player.prototype.constructor.call(this, "WebPlayer");
}
WebPlayer.prototype = new Player();

WebPlayer.prototype.play = function(url) {
    Player.prototype.play.call(this, url);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.src = url + "?stream";
    audioElement.play();
}

WebPlayer.prototype.pause = function() {
    Player.prototype.pause.call(this);
    var audioElement = $("#audioPlayer").get(0);
    audioElement.pause();
}
