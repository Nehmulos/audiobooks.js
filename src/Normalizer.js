var fs = require("fs"),
    path = require("path"),
    querystring = require("querystring"),
    gm = require("../node_modules/gm/index.js"),
    exec = require('child_process').exec,
    fileServer = require("./FileServer.js");

function Normalizer() {

}

Normaliser.prototype.unifyTrackNamesForBook = function(cdDirectory, finishCallback) {

}

Normaliser.prototype.unifyTrackNamesForCd = function(cdDirectory, finishCallback) {
    fs.readdir(directory, function(error, files) {
        var unhandledFiles = files.length;
        var playableFiles = [];
        var matches = [];
        
        // TODO horrible 
        
        // "1. CD 3 The 1st tale of xyz part 1"
        // "10. CD 12 Another tale"
        // unify to "01. CD 33 The 1st tale of xyz part 1"
        function unify() {
            var numberOfMatches = -1;
            // [3] (matches) -> wut
            var groups = {};
            for (var i=1; i < matches.length; ++i) {
                var m = matches[i];
                var index = m.length;
                if (!groups[index]) {
                    groups[index] = [];
                }
                groups[index].push(m);
            }
            
            for (key in groups) {
                if (key != "length") {
                    var lengths = new Array(groups[key]+1).join('0').split('');
                    for (var i=0; i < groups[key].length; ++i) {
                        if (lengths[i] < groups[key][i].length) {
                            lengths[i] = groups[key][i].length;
                        }
                    }
                    for (var i=0; i < lengths; ++i) {
                        if (groups[key][i].length < lengths[i]) {
                            playableFiles[i].replace(/([0-9]+)/, function(original, j) {
                                if (j == i)
                            })
                        }
                    }
                }
            }
        }
        
        function checkEnd() {
            --unhandledFiles;
            if (unhandledFiles <= 0) {
                handleImages();                  
            }
        }
        
        for(var i=0; i < files.length; ++i) {
            var filename = files[i];
            
            if (!fileServer.isPlayableFile(filename)) {
                checkEnd();
                continue;
            }
            
            /([0-9]+)/.exec(filename);
        
            fs.stat(path.join(directory, files[i]), (function(filename, i) {
                return function(error, stats) {
                    if(error) {
                        console.log("can not read file " + filename);
                        callback(error, []);
                        return;
                    }

                    // handle other directories                        
                    if(stats.isDirectory()) {
                        handleDirectory(path.join(directory, filename));
                    }
                    
                    if (stats.isFile() && fileServer.isImage(filename)) {
                        potentialCovers.push(filename);
                    }
                    checkEnd();
                }
            })(filename, i);
        }
        
        matches[i] = /([0-9]+)/.exec(trackName);
    }
}

//TODO split into more separate functions
Normalizer.prototype.generateCoverThumbnails = function(baseDirectory, onDirectoryUncertain) {
    var _this = this;
    var handleDirectory = function(directory) {
        fs.readdir(directory, function(error, files) {
            if(error) {
                console.log("error reading dir:"+ directory);
                return;
            }
            var unhandledFiles = files.length;
            var potentialCovers = [];
            
            var handleImages = function() {
                var unfetchedImageDataCount = potentialCovers.length;
                var coverData = [];
                var bestImage = null;
                
                if (potentialCovers.length == 0 && onDirectoryUncertain) {
                    onDirectoryUncertain({covers:[]});
                }
                
                for (var i=0; i < potentialCovers.length; ++i) {
                    _this.getImageInfos(path.join(directory, potentialCovers[i]),
                        function(error, info) {
                        
                        if (error) {
                            return;
                        }

                        if (!bestImage) {
                            bestImage = info;
                        }                        
                        
                        var combinedSize = info.width + info.height;
                        if (combinedSize > bestImage.width + bestImage.height) {
                            bestImage = info;
                        }
                        
                        if (unhandledFiles <= 0) {
                            
                            if (bestImage.width + bestImage.height <= 400) {
                            
                            }
                        
                            _this.convertCoverToThumbnail(bestImage.filepath,
                                                            directory);
                        }
                    });
                }
            };
            
            for(var i=0; i < files.length; ++i) {
                fs.stat(path.join(directory, files[i]), (function(filename) {
                    return function(error, stats) {
                        if(error) {
                            console.log("can not read file " + filename);
                            callback(error, []);
                            return;
                        }

                        // handle other directories                        
                        if(stats.isDirectory()) {
                            handleDirectory(path.join(directory, filename));
                        }
                        
                        if (stats.isFile() && fileServer.isImage(filename)) {
                            potentialCovers.push(filename);
                        }
                        --unhandledFiles;

                        if (unhandledFiles <= 0) {
                            handleImages();                  
                        }
                    }
                })(files[i]));
            }
        });
    };
    handleDirectory(baseDirectory);
}

Normalizer.prototype.getImageInfos = function(imagepath, callback) {

    gm(imagepath).size(function(error, value) {
        if (error) {
            console.log("can not get size of img: "+ error);
            callback(error);
            return;
        }
        console.log(value);
        var info = {
            filepath: imagepath,
            width: value.width,
            height: value.height
        }

        callback(null, info);
    });
}

Normalizer.prototype.convertCoverToThumbnail = function(filepath, directory,
                                                        callback) {
                                                        
        gm(filepath).resize(200, 200).write(path.join(directory, "cover.png"),
        function (error) {
            if (error) {
                console.log("could not write thumbnail: " + filepath);
                console.log("error: " + error);
                return;
            }
            console.log("converted " + filepath);
        });
}


// exported instance
var normalizer = new Normalizer();
normalizer.Normalizer = Normalizer;

module.exports = normalizer;
