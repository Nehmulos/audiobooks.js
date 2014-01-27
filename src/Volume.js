var fs = require("fs"),
    path = require("path"),
    querystring = require("querystring"),
    exec = require('child_process').exec;

function Volume() {
    this.findDeviceName();
}

Volume.prototype.set = function(res, volume) {
    if (typeof volume === "string" && !/^[0-9]*$/.test(volume)) {
        res.writeHead(400, {"Content-Type": "application/json"});
        res.end('{"error": "invalid volume format. Must be a number (0-100)"}');
        return;
    }
    
    var self = this;
    var command = "amixer set " + this.device + " " + volume + "%";
    exec(command, function (error, stdout, stderr) {
        if (error) {
            self.execError(stdout, stderr, command, error, res, self);
            return;
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "volume set to '+ volume + '",' + 
                ' "volume": "' + volume + '"}');
    });
}

Volume.prototype.get = function(res) {
    var self = this;
    var command = "amixer get " + this.device;
    exec(command, function (error, stdout, stderr) {
        if (error) {
            self.execError(stdout, stderr, command, error, res, self);
            return;
        }
        var volumeMatches = /([0-9]+)%/.exec("" + stdout);
        if (volumeMatches && volumeMatches.length > 1) {
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

Volume.prototype.findDeviceName = function() {
    if (this.device == "getting") {
        return;
    }
    this.device = "getting";
    var self = this;
    exec("amixer", function (error, stdout, stderr) {
        if (error) {
            self.execError(stdout, stderr, command, error, res);
            return;
        }
        var deviceMatch = /'(.+)'/.exec("" + stdout);
        if (deviceMatch.length > 1) {
            self.device = deviceMatch[1];
        } else {
            self.device = null;
        }
    });
}

Volume.prototype.execError = function(stdout, stderr, command, error, res, self) {
    console.log("stdout " + stdout);
    console.log("stderr " + stderr);
    console.log(command);
    console.log("could not set volume: " + error);
    
    var errorObject = {error: ""+error};
    
    res.writeHead(500, {"Content-Type": "application/json"});
    res.end(JSON.stringify(errorObject));
    if (self) {
        self.findDeviceName();
    }
}


// exported instance
var volume = new Volume();
volume.Volume = Volume;

module.exports = volume;
