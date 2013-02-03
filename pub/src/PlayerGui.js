function PlayerGui() {
    this.init();
}

PlayerGui.prototype.init = function() {
    $(".playerGui .stopButton").click(function() {
        app.player.stop();
    });
    
    $(".playerGui .pauseButton").click(function() {
        if (!$(this).hasClass("disabled")) {
            $(".playerGui .pauseButton").hide();
            $(".playerGui .pauseButton").addClass("disabled");
            $(".playerGui .playButton").show();
            $(".playerGui .playButton").removeClass("disabled");
        }
    });
    
    $(".playerGui .pauseButton").click(function() {
        if (!$(this).hasClass("disabled")) {
            $(".playerGui .playButton").hide();
            $(".playerGui .playButton").addClass("disabled");
            $(".playerGui .pauseButton").show();
            $(".playerGui .pauseButton").removeClass("disabled");
        }
    });
}
