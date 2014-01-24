var fs = require("fs"),
    path = require("path"),
    fileServer = require("./FileServer.js"),
    listing = require("./Listing.js"),
    player = require("./Player.js"),
    normalizer = require("./Normalizer.js"),
    volume = require("./Volume.js"),
    querystring = require("querystring"),
    exec = require('child_process').exec;

function Api() {

}

Api.prototype.isApiUrl = function(url) {
    return new RegExp("\\/api\\/").test(url);
}

// ugly TODO make an object that maps paths to functions
Api.prototype.handleUri = function(res, req, uri) {
    
    if(uri.pathname == "/api/authors.json" || uri.pathname == "/api/artists.json") {
        listing.sendArtistList(res, uri.pathname);

    } else if(uri.pathname == "/api/author.json" && uri.search) {
        listing.sendBookList(res, uri.query);

    } else if(uri.pathname == "/api/book.json" && uri.search) {
        var segments = querystring.parse(uri.query);
        if(!segments["author"] || !segments["book"]) {
            res.end("requsts requires query like: book.json?author=i&book=j");
        } 
        listing.sendTrackList(res, segments["author"], segments["book"]);

    } else if(uri.query == "stream") {
        console.log("start streaming");
        uri.pathname = uri.pathname.replace(/(\.\.)/g, "");
        streamFile(res, path.join("pub", uri.pathname), req);

    } else if (uri.pathname == "/api/normalize") {
        //TODO fix paths on file system change all extensions to lowercase
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "not implemented on server"}')

    } else if (uri.pathname == "/api/play" && uri.query) {
        var args = JSON.parse(decodeURIComponent(uri.query)) || {};
        if (args.track) {
            player.play(res, args.track);
        } else {
            player.play(res, args.trackList);
        }
        
    } else if (uri.pathname == "/api/setTrackList") {
        var body = ""; // WARNING only allows 1 client
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            console.log(body);
            var args = JSON.parse(body);
            player.setTrackList(res, args.trackList);
        });

        
    } else if (uri.pathname == "/api/togglePause") {
        player.togglePause(res);

    } else if (uri.pathname == "/api/pause") {
        player.pause(res);

    } else if (uri.pathname == "/api/unPause") {
        player.unPause(res);

    } else if (uri.pathname == "/api/stop") {
        player.stop(res);

    } else if (uri.pathname == "/api/getProgress") {
        player.sendProgress(res);
        
    } else if (uri.pathname == "/api/getPlayStatus") {
        player.sendPlayStatus(res);

    } else if (uri.pathname == "/api/activateTimeout") {
        // 2h default delay
        var delay = parseInt(decodeURIComponent(uri.query)) || 1000*60*60 * 2;
        console.log(delay);
        player.activateTimeout(res, delay);
        
    } else if (uri.pathname == "/api/removeTimeout") {
        player.removeTimeout(res);

    } else if (uri.pathname == "/api/setVolume" && uri.query) {
        volume.set(res, uri.query);
        
    } else if (uri.pathname == "/api/getVolume") {
        volume.get(res);
        
    } else if (uri.pathname == "/api/createCoverThumbnails") {
        normalizer.generateCoverThumbnails("pub/books/", function(covers) {
            //covers
        });
        
    } else if (uri.pathname == "/api/unifyTrackNamesForCd" && uri.query) {
        var p = fileServer.resolveUrl(path.join("books", uri.query))
        console.log(p);
        normalizer.unifyTrackNamesForCd(p, function(error) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end('{"status": "okay"}');
        });
    
    } else if (uri.pathname == "/api/buildDate") {
        this.buildDate(res);
    
    } else {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{' +
                '"error":404,' +
                '"description":"No Action for Url '+uri.pathname+' with query '+
                uri.query +
                '"}');
    }
    
}

Api.prototype.buildDate = function(res) {
    exec("git log -1 --format=\"%cd\"", function (error, stdout, stderr) {
        if (error) {
            console.log("could not get git last commit:" + error);
            console.log(stderr);
            
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify({error: ""+error}));
            return;
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: ""+stdout}));
    });
}

/*
    fs.exists(path.join(directory, filename, "cover.png"), function(exists)
    directoriesJson.cover = filename + "cover.png";
    fs.exists(path.join(directory, filename, "cover.jpg"), function(exists)
    directoriesJson.cover = filename + "cover.jpg";
    fs.exists(path.join(directory, filename, "cover.jpeg"), function(exists)
    directoriesJson.cover = filename + "cover.jpeg";
*/


//if(new RegExp("^\/api","").test(uri) == true) 

function streamFile(res, fp, req)
{
    var filepath = fp;
    
    fs.exists(filepath, function(exists)
    {
        console.log(filepath + exists);
        if(!exists)
        {
            res.writeHead(404, {"Content-Type":"text/plain"});
            res.write("404 Not found ;_; \n");
            res.end();
            return;
        }
/*
        fs.stat(filepath, function(error, stats)
        {
            fs.createReadStream(filepath);
            var size = stats.size;
            res.writeHead(200, 
            {
                "Content-Type": mime.lookup(filepath),
                "Content-Range": "bytes 0-"+(size-1)+"/"+size,
                "Content-Length": size
            });
            
            
            var readStream = fs.createReadStream(filepath);
            readStream.on("data", function(data) {
                res.write(data, "binary");
            });
        
            readStream.on("end", function() {
                res.end();
            });

        });
*/
        var onGotStream = function()
        {
            console.log("gotStream");
            var code = 200;
            var range = req.headers.range; 
            var resHeaders = 
            {
                "Content-Type":mime.lookup(filepath),
//                'Transfer-Encoding': 'identity',
                "Accept-Ranges": "bytes"
            };
            
            if(!range)
            {
                console.log("correct bytes");
            }
            
            console.log(range);
            var maxChunkSize = stream.size;//4*(1024*1024);
            var start = range ? parseInt(range.replace(/bytes=/, "").split("-")[0]) : 0;
            var end = (start + maxChunkSize) < stream.size ? (start + maxChunkSize) : stream.size-1; 
            var chunkSize = (end-start)+1;
            
            if(start > 0) {
                console.log(start);
            }
            
            if(range) {
                code = 206;
                resHeaders["Content-Range"] = "bytes "+ start +"-"+ end + "/"+ chunkSize;
            }
            
            resHeaders["Content-Length"] = chunkSize;
            res.writeHead(code, resHeaders);
            res.write(stream.file.slice(start, end), "binary");
            res.end();
        }

        var stream = openStreams[filepath];
        if(!stream) {
            fs.readFile(filepath, "binary", function(error, file) {
                if(error) {
                    res.writeHead(500);
                    res.write("internal error");
                    res.end();
                    return;
                }
                
                stream = {
                    res: res,
                    size: file.length,
                    clientCount: 1,
                    file: file
                };
                openStreams[filepath] = stream;
                onGotStream();
            });
        } else {
            onGotStream();
        }
    });
}


// exported instance
var api = new Api();
api.Api = Api;

module.exports = api;
