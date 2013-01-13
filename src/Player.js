var fs = require("fs"),
    path = require("path"),
    spawn = require('child_process').spawn;
    fileServer = require("./FileServer.js"),
    querystring = require("querystring");

function Player() {
    this.track = null;
    this.progress = null;
    this.playStatus = "none";
    this.mplayerProcess = null;
    this.paused = false;
}

Player.prototype.play = function(res, url) {
    if (url.substr(0, 7) != "http://") {
        url = fileServer.resolveUrl(url);
    }
        
    this.playWithMplayer(url);
    res.writeHead(200, {"Content-Type": "application/json"});
    res.end('{"status": "started"}');
}

Player.prototype.togglePause = function(res) {
    if (this.mplayerProcess) {
        this.mplayerProcess.stdin.write("p");
        this.paused = !this.paused;
        var status = this.paused ? "paused" : "playing";
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "'+status+'"}');
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
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end('{"status": "stopped"}');
    }
    res.writeHead(412, {"Content-Type": "application/json"});
    res.end('{"status": "no track"}');
}

Player.prototype.playWithMplayer = function(url) {
    if (this.mplayerProcess) {
        this.mplayerProcess.kill();
    }

    var _this = this;
    console.log("play"+url);
    this.mplayerProcess = spawn("mplayer", [url]); // escapes spaces, too.
    this.mplayerProcess.stdout.on("data", function(data) {
        _this.onMplayerOutput(data);
    });
    this.mplayerProcess.stderr.on("data", function(data) {
        console.log("ERROR: " +data);
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
        // after a few seconds it will output something that matches:
        // /Exiting\.\.\. \(End of file\)/.test(line)
        if (/^\n\n\n*$/.test(line)) {
            this.playStatus = "ended";
            console.log("endofFile");
        } else {
            this.progress = this.parseMplayerProgress("" + line);
            console.log(this.progress);
        }
    } else if (this.playStatus == "ended") {
        this.mplayerProcess = null;
        console.log("exit mplayer");
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
    } else {
        res.writeHead(412, {"Content-Type": "application/json"});
        res.end('{"error": "no progress, as nothing is played atm."}');    
    }
}

// exported instance
var player = new Player();
player.Player = Player;

module.exports = player;
