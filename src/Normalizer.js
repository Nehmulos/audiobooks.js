var fs = require("fs"),
    path = require("path"),
    querystring = require("querystring"),
    exec = require('child_process').exec;

function Normalizer() {

}

//TODO split into more separate functions
Normalizer.prototype.generateCoverThumbnails = function(baseDirectory) {
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

    exec("identify \"" + imagepath + "\"", function (error, stdout, stderr) {
        //console.log("stdout " + stdout);
        if (error) {
            console.log("stderr " + stderr);
            console.log("could not get img info for '" + imagepath +
                        "' error:" + error);
            callback(error);
            return;
        }
        
        var infoSlices = stdout.replace(imagepath + " ", "").split(" ");
        var sizeMatches = /([0-9]+)x([0-9]+)/.exec(infoSlices[1]);
        //console.log(infoSlices);
        
        var info = {
            filepath: imagepath,
            format: infoSlices[0],
            width: parseInt(sizeMatches[1]),
            height: parseInt(sizeMatches[2])
        }
        //console.log(info);
        callback(null, info);
    });
}

Normalizer.prototype.convertCoverToThumbnail = function(filepath, directory,
                                                        callback) {
    
    exec("convert \"" + filepath + "\" -resize 200x200 \"" + 
         path.join(directory, "cover.png") + "\"",
         function (error, stdout, stderr) {
        
        if (error) {
            console.log("stderr " + stderr);
            console.log("could not convert image '" + filepath +
                        "' error:" + error);
            return;
        }
        
        console.log("coverted '" + filepath + "' to '" +
                    path.join(directory, "cover.png") + "'");
    });
}


// exported instance
var normalizer = new Normalizer();
normalizer.Normalizer = Normalizer;

module.exports = normalizer;
