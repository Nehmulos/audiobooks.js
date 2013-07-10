function AuthorsScreen() {
    Screen.prototype.constructor.call(this);
}

AuthorsScreen.prototype = new Screen();

AuthorsScreen.prototype.createNodes = function() {
    var _this = this;
    
    app.toolbar.setAuthor(null);
    
    var buildNodesFromJson = function(data) 
    {
        $.each(data.authors, function()
        {
            var author = this;
            var $jewelDiv = $("<div class='JewelCase'/>");
            var $jewelAnchor = $("<a class='authorLink' href='#!/"+ author +"'/>");
            
            var jewelCoverImage = document.createElement("img");
            jewelCoverImage.className = "Cover";
            jewelCoverImage.onerror = Utils.multiPostfixCoverFunction("books/"+ author +"/cover");
            jewelCoverImage.src = "books/" + author + "/cover.png";
            
            $jewelDiv.append($jewelAnchor);
            $("#main").append($jewelDiv);
            
            $jewelAnchor.append(jewelCoverImage);
            $jewelAnchor.append("<img class='CoverOverlay' src='img/coverOverlay_old.png'/>");
            $jewelAnchor.append("<span class='Caption'>"+ author +"</span>");
        });
    };
    
    if(app.fileCache.authors) {
        buildNodesFromJson(app.fileCache.authors);
    } else {
        $.getJSON("api/authors.json", function(data) {
            console.log(data);
            data.authors.sort();
            app.fileCache.authors = data;
            buildNodesFromJson(data);
        });
    }
}

AuthorsScreen.prototype.removeNodes = function() {
    $("#main").empty();
}
