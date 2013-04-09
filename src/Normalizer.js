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
        var tracks = {}
        
        for(var i=0; i < files.length; ++i) {
            var filename = files[i];
            
            if (!fileServer.isPlayableFile(filename)) {
                continue;
            }
            
            tracks.push({
                name: filename,
                matches: /([0-9]+)/.exec(filename)
            });
        }
        
        // "1. CD 3 The 1st tale of xyz part 1"
        // "10. CD 12 Another tale"
        // unify to "01. CD 33 The 1st tale of xyz part 1"
        for (var t=0; t < tracks.length; ++t) {
            var matches = tracks[t].matches;
            var numberOfMatches = -1;
            var groups = {};
            
            // group tracks by count of numberGroups /([0-9]+)/
            for (var i=1; i < matches.length; ++i) {
                var m = matches[i];
                var index = m.length;
                if (!groups[index]) {
                    groups[index] = [];
                }
                groups[index].push(m);
            }
            
            for (key in groups) {
                if (key == "length") {
                    continue;
                }
                
                var occurances = groups[key]
                
                // find the longest number for each match
                // this obscure line creates an array filled with 0
                var lengths = new Array(occurances.length+1).join('0').split('');
                for (var i=0; i < occurances.length; ++i) {
                    if (lengths[i] < occurances[i].length) {
                        lengths[i] = occurances[i].length;
                    }
                }
                
                // put 0 infront of matches that are shorter than the longest number
                for (var i=0; i < lengths.length; ++i) {
                    if (occurances[i].length < lengths[i]) {
                        tracks[t].replace(/([0-9]+)/, function(original, j) {
                            if (j == i) {
                                return  new Array(lengths[i]+1).join('0');
                            }
                            return original;
                        });
                    }
                }
            }
        }
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
