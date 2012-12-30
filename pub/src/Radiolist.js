$(function() {
    $(".showRadiosButton").mouseover(function() {
        $("#radioList").show("slow");
    });
    
    $("#radioList").mouseleave(function() {
        $("#radioList").hide("slow");
    });

    $(".radioLink").click(function() {
        //TODO use the player object
        $("#audioPlayer").attr("src", $(this).attr("data-url"));
        $("#audioPlayer").get(0).play();
    });
});
