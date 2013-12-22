var http = require("http"),
    url = require("url"),
    fileSever = require("./src/FileServer.js"),
    api = require("./src/Api.js");

var openStreams = [];
var port = 8081;

http.createServer(function(req, res) {
    var uri = url.parse(req.url);
    if (api.isApiUrl(uri.pathname)) {
        api.handleUri(res, req, uri);
    } else if(uri.pathname == "/") {
        fileSever.sendFile(req, res, "index.html");
    } else {
        fileSever.sendFile(req, res, uri.pathname);
    }
}).listen(port);

console.log("started audiobooks service at port: " + port);
