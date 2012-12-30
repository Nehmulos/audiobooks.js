function Toolbar() {
    this.author = null;
    this.book = null;
}

Toolbar.prototype.init = function() {
    var _this = this;
    $(".cleanCacheButton").click(function() { _this.cleanCache(); });
}

Toolbar.prototype.setAuthor = function(author) {
    this.author = author;

    this.setBook(null);
    $("#toolbar .authorName").empty();
    if (author) {
        var a = $("<a href='#!/" + author + "'>"+author+"</a>");
        $("#toolbar .authorName").append(a);
    }
}

Toolbar.prototype.setBook = function(book) {
    this.book = book;
    $("#toolbar .bookName").empty();
    if (book) {
        var a = $("<a href='#!/" + this.author + "/" + book+"'>"+book+"</a>");
        $("#toolbar .bookName").append(a);
        $("#toolbar .authorName").append($("<span class='arrow'> &gt;</span>"));
    }
}

// TODO move into Tools.js
Toolbar.prototype.cleanCache = function() {
    
}
