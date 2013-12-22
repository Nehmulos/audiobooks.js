var fs = require("fs"),
    path = require("path"),
    fileServer = require("./FileServer.js"),
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

// ugly
Api.prototype.handleUri = function(res, req, uri) {
    
    if(uri.pathname == "/api/authors.json" || uri.pathname == "/api/artists.json") {
        this.sendArtistList(res, uri.pathname);

    } else if(uri.pathname == "/api/author.json" && uri.search) {
        this.sendBookList(res, uri.query);

    } else if(uri.pathname == "/api/book.json" && uri.search) {
        var segments = querystring.parse(uri.query);
        if(!segments["author"] || !segments["book"]) {
            res.end("requsts requires query like: book.json?author=i&book=j");
        } 
        this.sendTrackList(res, segments["author"], segments["book"]);

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

Api.prototype.sendArtistList = function(res, artist) {
    this.getDirectoryList(fileServer.resolveUrl("books/"), true, function(error, listing) {
        var jsonObject = {
            authors: listing.directories,
            covers: listing.covers
        };
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(jsonObject), "utf8");
        res.end();
    });
}

Api.prototype.sendBookList = function(res, artist) {
    this.getDirectoryList(fileServer.resolveUrl("books/" + artist + "/"), true, function(error, listing) {
        var jsonObject = {
            books: listing.directories,
            covers: listing.covers
        };
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(jsonObject), "utf8");
        res.end();
    });
}

function findCover(directory, callback) {
    var extensions = [".png", ".jpg", ".jpeg"];
    function next(i) {
        var file = path.join(directory, "cover" + extensions[i]);
        fs.exists(file, function(exists) {
            if (exists) {
                callback(false, file);
            } else {
                ++i;
                if (i < extensions.length) {
                    next(i+1);
                } else {
                    callback(true, "img/coverOverlay_old.png");
                }
            }
        });
    }
    next(0);
}


Api.prototype.getDirectoryList = function(directory, covers, callback) {
    fs.readdir(directory, function(error, files) {
        if(error) {
            console.log("error reading dir:"+ directory);
            callback(error, []);
            return;
        }
        var directories = [];
        var covers = [];
        var unprocessed = files.length * (covers ? 2 : 1);
        
        function processed() {
            unprocessed--;
            if(unprocessed <= 0) {
                callback(false, {
                    directories: directories,
                    covers: covers
                });
            }
        }
        
        for (var i=0; i < files.length; ++i) {
            (function() {
                var filename = files[i];
                var absolute = path.join(directory, files[i]);
                fs.stat(absolute, function(error, stats) {
                    if (error) {
                        console.log("can not read file " + absolute);
                        callback(error, []);
                        return;
                    }
                    
                    if (stats.isDirectory()) {
                        directories.push(filename);
                        if (covers) {
                            findCover(absolute, function(error, cover) {
                                var base = path.basename(cover);
                                if (error) {
                                    covers.push(path.join("img", base));   
                                } else {
                                    covers.push(path.join(filename, base));
                                }
                                processed();
                            });
                        }
                    }
                    processed();
                });
            })();
        }
    });
}

Api.prototype.sendTrackList = function(res, artist, book) {
    var _this = this;
    var url = fileServer.resolveUrl("books/" + artist + "/" + book);
    this.getDirectoryList(url, false, function(error, listing) {
        var jsonObject = {cds:[]};
        var cds = listing.directories;
        var unprocessedCds = cds.directories.length;        
        var onReceivedCdTracks = function(error, cd, tracks) {
            jsonObject.cds.push({name:cd, tracks:tracks});

            --unprocessedCds;
            if (unprocessedCds <= 0) {
                //console.log(JSON.stringify(jsonObject));
                res.writeHead(200, {"Content-Type": "application/json"});
                res.write(JSON.stringify(jsonObject), "utf8");
                res.end();
            }
        }
        
        for (var i=0; i < cds.length; ++i) {
            _this.getPlayableFileList(url + "/" + cds[i], cds[i], onReceivedCdTracks);
        }
    });
}

Api.prototype.getPlayableFileList = function(directory, cdName, callback) {
    fs.readdir(directory, function(error, files) {
        if(error) {
            console.log("error reading dir:"+ directory);
            callback(error, cdName, []);
            return;
        }
        var tracks = [];
        var unProcessedFiles = files.length;
        for(var i=0; i < files.length; ++i) {
            // motherfuncting new scope
            fs.stat(path.join(directory, files[i]), (function(filename) {
                return function(error, stats) {
                    if(error) {
                        console.log("can not read file " + filename);
                        callback(error, []);
                        return;
                    }
                    
                    if(stats.isFile() && fileServer.isPlayableFile()) {
                        tracks.push(filename);
                    }

                    unProcessedFiles--;
                    if(unProcessedFiles <= 0) {
                        callback(false, cdName, tracks);
                    }
                }
            })(files[i]));
        }
    });
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
