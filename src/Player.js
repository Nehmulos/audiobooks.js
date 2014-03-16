var fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn;
    fileServer = require("./FileServer.js"),
    querystring = require("querystring");

function Player() {
    this.track = null;
    this.trackList = [];
    this.progress = null;
    this.mplayerProcess = null;
    this.paused = true;
    this.autoPauseTimeoutId = null;
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
        this.mplayerProcess.stdin.write("pause\n");
        this.paused = !this.paused;
        if (res) {
            var status = this.paused ? "paused" : "playing";
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end('{"status": "'+status+'"}');
        }
        return;
    }
    if (this.trackList.length > 0) {
        this.play(res, this.trackList);
        return;
    }
    if (res) {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"error": "no track"}');
    }
}

Player.prototype.pause = function(res) {
    if (!this.paused) {
        this.togglePause(res);
        return;
    }
    if (res) {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"status": "already paused"}');
    }
}

Player.prototype.unPause = function(res) {
    if (this.paused) {
        this.togglePause(res);
        return;
    }
    if (res) {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"status": "already playing"}');
    }
}

// stop list and process
Player.prototype.stop = function(res) {
    this.paused = true;
    this.trackList = [];
    if (this.stopProcess() && res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "stopped"}');
    }
    
    if (res) {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"status": "no track"}');
    }
}

// just stop the process for the active track
Player.prototype.stopProcess = function() {
    this.track = null;
    this.progress = null;
    
    if (this.mplayerProcess) {
        this.mplayerProcess.kill();
        this.mplayerProcess = null;
        return true;
    }
    return false;
}

Player.prototype.playWithMplayer = function(url) {
    var _this = this;
    console.log("mplayer play: "+url);
    
    if (Object.prototype.toString.call(url) === "[object Array]") {
        if (url.length <= 0) {
            return;
        }
        this.trackList = url;
    } else if (typeof url === "string") {
        this.trackList = [url];
    }
    this.playNextOnTrackList();
}

Player.prototype.playNextOnTrackList = function() {
    //console.log("playlist = ",this.trackList);
    if (this.trackList.length == 0) {
        return;
    }
    this.stopProcess();
    
    var args = this.trackList.splice(0,1);
    args.push("--slave");
    this.track = args[0];
    
    this.paused = false;
    this.mplayerProcess = spawn("mplayer", args); // escapes spaces, too.
    
    var _this = this;
    this.mplayerProcess.stdout.on("data", function(data) {
        _this.onMplayerOutput(data);
    });
    this.mplayerProcess.stderr.on("data", function(data) {
        console.log("ERROR: " +data);
    });
    var process = this.mplayerProcess;
    this.mplayerProcess.on("close", function(code, signal) {
        if (process == _this.mplayerProcess) {
            _this.mplayerProcess = null;
        }
        _this.playNextOnTrackList();
    });
}

Player.prototype.onMplayerOutput = function(line) {
    var progress = this.parseMplayerProgress("" + line);
    if (progress && !isNaN(progress.current) && !isNaN(progress.current)) {
        this.progress = progress;
    }
}

// TODO regex to check for proper prefixes prefore times, A: V: and so on
Player.prototype.parseMplayerProgress = function(line) {
    if (line.length <= 2) {
        return null;
    }
    var parts = line.substr(2, line.length).split(" ");
    // remove multiple spaces
    for (var i=0; i < parts.length; ++i) {
        if (parts[i].length == 0) {
            parts.splice(i, 1);
            --i;
        }
    }

    if (parts.length < 4) {
        return null;
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

Player.prototype.sendPlayStatus = function(res) {
    var ret = {
        status: this.mplayerProcess ? "playing" : "none",
        progress: this.progress,
        paused: this.paused,
        track: this.track,
        trackList: this.trackList
    };

    res.writeHead(200, {"Content-Type": "application/json"});
    res.end(JSON.stringify(ret));
}

Player.prototype.activateTimeout = function(res, delay) {
    var self = this;
    this.removeTimeout();
    this.autoPauseTimeoutId = setTimeout(function() {
        self.pause();
        console.log("timeout");
    }, delay);
    
    if (res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: "timeout set", delay: delay}));
    }
}

Player.prototype.removeTimeout = function(res) {
    if (this.autoPauseTimeoutId != null) {
        clearTimeout(this.autoPauseTimeoutId);
        this.autoPauseTimeoutId = null;
        
        console.log("cancel timeout");

        if (res) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({status: "removed"}));
        }
        return;
    }
    if (res) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: "no timeout"}));
    }
}

// exported instance
var player = new Player();
player.Player = Player;

module.exports = player;
