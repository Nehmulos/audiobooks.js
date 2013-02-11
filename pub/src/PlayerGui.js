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
    
    $(".volumeSettings").mouseover(function() {
        var bar = $(this).find(".percentageBar");
        bar.show();
        bar.css("top", $(this).position().top - bar.height());
        bar.css("left", $(this).position().left);
    });
    
    $(".volumeSettings").mouseout(function() {
        var bar = $(this).find(".percentageBar");
        bar.hide();
    });
    
    $(".volumeSettings .percentageBar").click(function(event) {
        var clickY = event.pageY - $(this).offset().top;
        var percent = clickY / $(this).height();
        $(this).find(".disabledFill").css("height", percent * $(this).height());
        $(this).parent().attr("data-volume:", 1.0-percent);
        app.player.setVolume(1.0-percent);
    });
}
