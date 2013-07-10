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
            
            var path = "/" + _this.author + "/" + book + "/";
            var cover = Cover.createElement(path, this);
            document.getElementById("main").appendChild(cover);
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
