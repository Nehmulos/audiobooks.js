var fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn;
    fileServer = require("./FileServer.js"),
    querystring = require("querystring");

function Player() {
    this.track = null;
    this.trackList = [];
    this.progress = null;
    this.playStatus = "none";
    this.mplayerProcess = null;
    this.paused = true;
}

Player.prototype.play = function(res, url) {
    if (!url) {
        if (res) {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.end('{"status": "no url:string or urls:arrayOfStr provided"}');
        }
        return;
    }
    console.log("play " + url);
    
    if (typeof url === "string" && url.substr(0, 7) != "http://") {
        url = fileServer.resolveUrl(url);
    } else if (Object.prototype.toString.call(url) === "[object Array]") {
        // TODO strip --options
        for (var i=0; i < url.length; ++i) {
            if (url[i].substr(0, 7) != "http://") {
                url[i] = fileServer.resolveUrl(url[i]);
            }
        }
    }
        
    this.playWithMplayer(url);
    if (res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "started"}');
    }
}

Player.prototype.setTrackList = function(res, trackList) {
    this.trackList = trackList;
    console.log("set track list "+ this.trackList);
    
    if (res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "Tracklist set, not playing, yet."}');
    }
}

Player.prototype.togglePause = function(res) {
    if (this.mplayerProcess) {
        this.mplayerProcess.stdin.write("p");
        this.paused = !this.paused;
        var status = this.paused ? "paused" : "playing";
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "'+status+'"}');
        return;
    }
    if (this.trackList.length > 0) {
        this.play(res, this.trackList);
        return;
    }
    res.writeHead(412, {"Content-Type": "application/json"});
    res.end('{"status": "no track"}');
}

Player.prototype.pause = function(res) {
    if (!this.paused) {
        this.togglePause(res);
        return;
    }
    res.writeHead(412, {"Content-Type": "application/json"});
    res.end('{"status": "already paused"}');
}

Player.prototype.unPause = function(res) {
    if (this.paused) {
        this.togglePause(res);
        return;
    }
    res.writeHead(412, {"Content-Type": "application/json"});
    res.end('{"status": "already playing"}');
}

Player.prototype.stop = function(res) {
    if (this.mplayerProcess) {
        this.mplayerProcess.kill();
        this.mplayerProcess = null;
        this.paused = true;
        if (res) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end('{"status": "stopped"}');
        }
        return;
    }
    if (res) {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"status": "no track"}');
    }
}

Player.prototype.playWithMplayer = function(url) {
    if (this.mplayerProcess) {
        this.stop(null);
    }

    var _this = this;
    console.log("mplayer play: "+url);
    
    if (Object.prototype.toString.call(url) === "[object Array]") {
        if (url.length <= 0) {
            return;
        }
        this.track = url[0];
        this.trackList = url;
        this.mplayerProcess = spawn("mplayer", url); // escapes spaces, too.
        url.splice(0, 1);
    
    } else if (typeof url === "string") {
        this.track = url;
        this.mplayerProcess = spawn("mplayer", [url]); // escapes spaces, too.
    }
    
    this.mplayerProcess.stdout.on("data", function(data) {
        _this.onMplayerOutput(data);
    });
    this.mplayerProcess.stderr.on("data", function(data) {
        //console.log("ERROR: " +data);
    });
    this.playStatus = "init";
    this.paused = false;
}

Player.prototype.onMplayerOutput = function(line) {
    if (this.playStatus == "init") {
        if (/Starting playback\.\.\.\s$/.test(line)) {
            this.playStatus = "playing";
            console.log("mplayer started playing");
        }
    } else if (this.playStatus == "playing") {
        // mplayer will output 3 new lines after a file reached the end
        // after that either the next file will be played, or mplayer will exit
        if (/^\n\n\n*$/.test(line)) {
            this.playStatus = "ended";
            console.log("endofFile");
        } else {
            this.progress = this.parseMplayerProgress("" + line);
            //console.log(this.progress);
        }
    } else if (this.playStatus == "ended") {
        //console.log("" +line);
        
        if (/Exiting\.\.\. \(End of file\)/.test(line)) {
            this.mplayerProcess = null;
            console.log("exit mplayer");
            if (this.trackList.length > 0) {
                this.play(null, this.trackList[0]);
                console.log("next track" + this.trackList[0]);
            }
            
        } else if (/Playing /.text(line)) {
            this.playStatus = "init";
            var matches = /Playing (.*?)$/.match(line);
            console.log(matches);
            if (matches.length == 1 && this.trackList.length > 0 && 
                matches[0] == this.trackList[0]) {
                this.track = matches[0];
                this.trackList.splice(0,1);
            } 
        }
    } else {
        console.log("don't know how to handle mplayer output: " + line);
    }
}

Player.prototype.parseMplayerProgress = function(line) {
    var parts = line.substr(2, line.length).split(" ");
    // remove multiple spaces
    for (var i=0; i < parts.length; ++i) {
        if (parts[i].length == 0) {
            parts.splice(i, 1);
            --i;
        }
    }
    
    var progress = {
        current: parseFloat(parts[0]),
        length: parseFloat(parts[3])
    };
    
    return progress;
}


Player.prototype.sendProgress = function(res) {
    if (this.progress) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"progress":'+JSON.stringify(this.progress)+'}');
        return;
    }
    res.writeHead(412, {"Content-Type": "application/json"});
    res.end('{"error": "no progress, as nothing is played atm."}');    
}

// exported instance
var player = new Player();
player.Player = Player;

module.exports = player;
