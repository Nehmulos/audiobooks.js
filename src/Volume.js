var fs = require("fs"),
    path = require("path"),
    querystring = require("querystring"),
    exec = require('child_process').exec;

function Volume() {
}

Volume.prototype.set = function(res, volume) {
    if (typeof volume === "string" && !/^[0-9]*$/.test(volume)) {
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end('{"error": "invalid volume format. Must be a number (0-100)"}');
        return;
    }

    exec("amixer set Master " + volume + "%", function (error, stdout, stderr) {
        if (error) {
            console.log("stdout " + stdout);
            console.log("stderr " + stderr);
            console.log("could not set volume: " + error);
            
            var errorObject = {error: ""+error};
            
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify(errorObject));
            return;
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "volume set to '+ volume + '",' + 
                ' "volume": "' + volume + '"}');
    });
}

Volume.prototype.get = function(res) {
    exec("amixer get Master", function (error, stdout, stderr) {
        if (error) {
            console.log("stdout " + stdout);
            console.log("stderr " + stderr);
            console.log("could not get volume: " + error);
            
            var errorObject = {error: ""+error};
            
            res.writeHead(500, {"Content-Type": "application/json"});
            res.end(JSON.stringify(errorObject));
            return;
        }
        var volumeMatches = /([0-9]+)%/.exec("" + stdout);
        if (volumeMatches.length > 1) {
            // send volume of first speaker (in most cases the left one)
            // IMPROVEMENT send a value for each speaker + speakerName
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end('{"volume": ' + volumeMatches[1] + '}');
            return;
        }
        res.writeHead(500, {"Content-Type": "application/json"});
        res.end('{"status": "could not parse volume","error":"parseError"}');
    });
}


// exported instance
var volume = new Volume();
volume.Volume = Volume;

module.exports = volume;
