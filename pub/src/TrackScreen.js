function TrackScreen(author, book) {
    this.author = author;
    this.book = book;
}

TrackScreen.prototype.createNodes = function() {
    var _this = this;
    
    app.toolbar.setAuthor(this.author);
    app.toolbar.setBook(this.book);
    
    //TODO don't use this shitty way of cache checking, use a proper getter
    if(app.fileCache.author[this.author] && app.fileCache.author[this.author].book) {
        buildNodesFromJson(app.fileCache.author[this.author].book[this.book]);
    } else {
        $.getJSON("api/book.json?author=" + _this.author +"&book="+ _this.book, function(data) {
            //data.cds = Utils.sortObject(data.cds);
            
            data.cds.sort(function(a,b) {
                return a.name > b.name;
            });
            
            $.each(data.cds, function() {
                this.tracks.sort();
            });
            
            if(!app.fileCache.author[_this.author]) {
                app.fileCache.author[_this.author] = new Object();
            }
            app.fileCache.author[_this.author].book = new Object();
            app.fileCache.author[_this.author].book[_this.book] = data;
            _this.buildNodesFromJson(data);
        });
    }
}

TrackScreen.prototype.buildNodesFromJson = function(data) {
    var _this = this;
    this.data = data;
    $.each(data.cds, function(cdIndex, cd) {
        var cdName = this.name;
        var $cdDiv = $("<div>"+ cdName +"</div>");
        var $cdList = $("<ol/>");
        $("#main").append($cdDiv);
        $cdDiv.append($cdList);
            
        $.each(cd.tracks, function(trackIndex) {
            var $trackLi = $("<li/>");
            var $playTrackLink = $("<a class='PlayTrackLink' href='"+window.location.hash+"'>"+this+"</a>");
            $playTrackLink.text(this); 
            $playTrackLink.attr("data-cd", cdName);
            $playTrackLink.attr("data-cd-index", cdIndex);
            $playTrackLink.attr("data-track-index", trackIndex);
            $playTrackLink.attr("data-track", this);
            $playTrackLink.attr("data-file", "books/" + _this.author + "/" +
                                _this.book + "/" + cdName + "/" + this);
            $trackLi.append($playTrackLink);
            $cdList.append($trackLi);
        });
    });
    
    $(".PlayTrackLink").click(function() {
        var trackIndex = parseInt($(this).attr("data-track-index"));
        var cdIndex = parseInt($(this).attr("data-cd-index"));
        var tracks = _this.data.cds[cdIndex].tracks.slice(trackIndex);
        
        var tracksToPaths = function(array, cdName) {
            for (var i=0; i < array.length; ++i) {
                array[i] = "books/" + _this.author + "/" +
                             _this.book + "/" + cdName + "/" + array[i];
            }
        }
        tracksToPaths(tracks, _this.data.cds[cdIndex].name);
        
        for (var i=cdIndex+1; i < _this.data.cds.length; ++i) {
            var cdPaths = _this.data.cds[i].tracks.slice();
            tracksToPaths(cdPaths, _this.data.cds[i].name);
            tracks = tracks.concat(cdPaths);
        }
        
        app.player.playList(tracks);
    });
}

TrackScreen.prototype.removeNodes = function() {
    $("#main").empty();
}
