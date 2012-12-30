/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function TrackScreen(author, book)
{
    this.author = author;
    this.book = book;
}

TrackScreen.prototype.createNodes = function()
{
    var _this = this;
    
    app.toolbar.setAuthor(this.author);
    app.toolbar.setBook(this.book);
    
    var buildNodesFromJson = function(data) 
    {
        $.each(data.cds, function(key, cd)
        {
            var cdName = this.name;
            var $cdDiv = $("<div>"+ cdName +"</div>");
            var $cdList = $("<ol/>");
            $("#main").append($cdDiv);
            $cdDiv.append($cdList);
                
            $.each(cd.tracks, function()
            {
                var $trackLi = $("<li/>");
                var $playTrackLink = $("<a class='PlayTrackLink' href='"+window.location.hash+"'>"+this+"</a>");
                $playTrackLink.text(this); 
                $playTrackLink.attr("data-cd", cdName);
                $playTrackLink.attr("data-track", this);
                $playTrackLink.attr("data-file", "books/"+ _this.author +"/"+ _this.book +"/"+ cdName + "/"+ this +"?stream");
                $trackLi.append($playTrackLink);
                $cdList.append($trackLi);
                
                $playTrackLink.click(function()
                {
                    var ap = $("#audioPlayer").get(0);
                    ap.src = $(this).attr("data-file");
                    ap.play()
                });
            });
        });
    };
    
    if(app.fileCache.author[this.author] && app.fileCache.author[this.author].book)
    {
        buildNodesFromJson(app.fileCache.author[this.author].book[this.book]);
    }
    else
    {
        $.getJSON("api/book.json?author=" + _this.author +"&book="+ _this.book, function(data) 
        {
            data.cds = Utils.sortObject(data.cds);
            $.each(data.cds, function() {
                this.tracks.sort();
            });
            
            if(!app.fileCache.author[_this.author]) {
                app.fileCache.author[_this.author] = new Object();
            }
            app.fileCache.author[_this.author].book = new Object();
            app.fileCache.author[_this.author].book[_this.book] = data;
            buildNodesFromJson(data);
        });
    }
}


TrackScreen.prototype.removeNodes = function()
{
    $("#main").empty();
}
