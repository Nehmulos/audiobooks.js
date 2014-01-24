var fs = require("fs"),
    path = require("path"),
    fileServer = require("./FileServer.js");

function Listing() {
}

Listing.prototype.getDirectoryList = function(directory, covers, callback) {
    fs.readdir(directory, function(error, files) {
        if(error) {
            console.log("error reading dir:"+ directory);
            callback(error, null);
            return;
        }
        var directories = [];
        var covers = [];
        var unprocessed = files.length;
        
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
                        callback(error, null);
                        return;
                    }
                    
                    if (stats.isDirectory()) {
                        directories.push(filename);
                        if (covers) {
                            ++unprocessed;
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

Listing.prototype.sendArtistList = function(res, artist) {
    this.getDirectoryList(fileServer.resolveUrl("books/"), true, function(error, listing) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write(JSON.stringify({error:"listing books/ failed"}), "utf8");
            res.end();
            return;
        }
        
        var jsonObject = {
            authors: listing.directories,
            covers: listing.covers
        };
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(jsonObject), "utf8");
        res.end();
    });
}

Listing.prototype.sendBookList = function(res, artist) {
    this.getDirectoryList(fileServer.resolveUrl("books/" + artist + "/"), true, function(error, listing) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write(JSON.stringify({error:"listing books/" + artist +"/ failed"}), "utf8");
            res.end();
            return;
        }
    
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
                    next(i);
                } else {
                    callback(true, "img/coverOverlay_old.png");
                }
            }
        });
    }
    next(0);
}

Listing.prototype.sendTrackList = function(res, artist, book) {
    var _this = this;
    var url = fileServer.resolveUrl("books/" + artist + "/" + book);
    this.getDirectoryList(url, false, function(error, listing) {
        if (error) {
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write(JSON.stringify({error:"listing cds failed"}), "utf8");
            res.end();
            return;
        }
    
        var jsonObject = {cds:[]};
        console.log(listing);
        var cds = listing.directories;
        var unprocessedCds = cds.length;        
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

Listing.prototype.getPlayableFileList = function(directory, cdName, callback) {
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


var listingExport = new Listing();
listingExport.Listing = Listing;

module.exports = listingExport;
