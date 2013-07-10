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
            var path = "/" + author + "/";
            var cover = Cover.createElement(path, author);
            document.getElementById("main").appendChild(cover);
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
