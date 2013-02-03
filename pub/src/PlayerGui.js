function PlayerGui() {
    this.init();
}

PlayerGui.prototype.init = function() {
    $(".playerGui .stopButton").click(function() {
        app.player.stop();
    });
    
    $(".playerGui .pauseButton").click(function() {
        app.player.pause();
        if (!$(this).hasClass("disabled")) {
            $(".playerGui .pauseButton").hide();
            $(".playerGui .playButton").show();
        }
    });
    
    $(".playerGui .playButton").click(function() {
        app.player.continuePlaying();
        if (!$(this).hasClass("disabled")) {
            $(".playerGui .playButton").hide();
            $(".playerGui .pauseButton").show();
        }
    });
}
