/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function BooksScreen(author)
{
    this.author = author;
}

BooksScreen.prototype.createNodes = function()
{
    var _this = this;
    
    app.toolbar.setAuthor(this.author);
    
    var buildNodesFromJson = function(data) 
    {
        $.each(data.books, function()
        {
            var book = this;
            var $jewelDiv = $("<div class='JewelCase'/>");
            
            var pathPrefix = "books/" + _this.author + "/" + book + "/";
            var jewelCoverImage = document.createElement("img");
            jewelCoverImage.className = "Cover";
            jewelCoverImage.onerror = Utils.multiPostfixCoverFunction(pathPrefix + "cover");
            jewelCoverImage.src = pathPrefix + "cover.png";
            
            var $jewelAnchor = $("<a class='bookLink' href='#!/" + pathPrefix + "'>");
            $jewelDiv.append($jewelAnchor);
            $("#main").append($jewelDiv);
            
            $jewelAnchor.append(jewelCoverImage);
            $jewelAnchor.append("<img class='CoverOverlay' src='img/coverOverlay_old.png'/>");
            $jewelAnchor.append("<span class='Caption'>"+this+"</span>");
            /*
            $jewelAnchor.click(function()
            {
                $(".bookLink").unbind("click");
                app.setScreen(new TrackScreen(_this.author, $(this).attr("data-book")));
            });
            */
            
        });
    };
    
    if(app.fileCache.author[this.author] && app.fileCache.author[this.author].books)
    {
        buildNodesFromJson(app.fileCache.author[this.author].books);
    }
    else
    {
        //TODO parse artist name from location hash
        console.log("api/author.json?" + _this.author);
        $.getJSON("api/author.json?" + _this.author, function(data) 
        {
            data.books.sort();
            app.fileCache.author[_this.author] = new Object();
            app.fileCache.author[_this.author].books = data;
            buildNodesFromJson(data);
        });
    }
}

BooksScreen.prototype.removeNodes = function()
{
    $("#main").empty();
}
