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
            var $jewelCoverImage = $("<img class='Cover' src='books/"+ author +"/cover.png'>");
            $jewelDiv.append($jewelAnchor);
            $("#main").append($jewelDiv);

            $jewelCoverImage.error(function()
            {
                // try jpg
                $(this).unbind("error");
                this.src = "books/"+ author +"/cover.jpg";
                $(this).error(function()
                {
                    // try jpeg
                    $(this).unbind("error");
                    this.src = "books/"+ author +"/cover.jpeg";
                    $(this).error(function()
                    {
                        // use 404 img
                        $(this).unbind("error");
                        this.src = "img/missingCover.png";
                    });
                });
            });
            
            $jewelAnchor.append($jewelCoverImage);
            $jewelAnchor.append("<img class='CoverOverlay' src='img/coverOverlay_old.png'/>");
            $jewelAnchor.append("<span class='Caption'>"+ author +"</span>");
            /*
            $jewelAnchor.click(function()
            {
                $(".authorLink").unbind("click");
                app.setScreen(new BooksScreen($(this).attr("data-author")));
            });
            */            
            //TODO check if cover exists, if not load cover404.png from app/img
            
            //crazy TODO cache images in js
            //            if(app.fileCache.authorCovers[this.name])
            //            {
            //                app.fileCache.authorCovers[this.name]
            //            }
        });
    };
    
    if(app.fileCache.authors) {
        buildNodesFromJson(app.fileCache.authors);
    } else {
        $.getJSON("api/authors.json", function(data) {
            console.log(data);
            app.fileCache.authors = data;
            buildNodesFromJson(data);
        });
    }
}

AuthorsScreen.prototype.removeNodes = function() {
    $("#main").empty();
}
