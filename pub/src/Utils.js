var Utils = function() {};
Utils.parseHashUrl = function(url) {
    if(url) {
        if(url.length > 1) {
            if(url.charAt(0) === '#') {
                var skipCharsAtStart = 1;
                if(url.charAt(skipCharsAtStart) === '!') {
                    skipCharsAtStart++;
                }
                if(url.charAt(skipCharsAtStart) === '/') {
                    skipCharsAtStart++;
                }
                url = url.substr(skipCharsAtStart);
            }

            if(url.charAt(url.length-1) === '/') {
                url = url.slice(0,url.length-1);
            }

            if(url.length != 0) {
                return url.split('/');
            }
        }
    }
    return [];
}

// Thanks to Chris Nielsen
// Url: http://stackoverflow.com/a/1359808
Utils.sortObject = function(o) {
    var sorted = {},
    key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}

// onError function for cover img element. Set this as onerror and src = png
Utils.multiPostfixCoverFunction = function(prefix) {
    return function(event) {
        // try jpg
        event.target.onerror = function(event) {
            // try jpeg
            event.target.onerror = function(event) {
                // use 404 img
                event.target.src = "img/missingCover.png";
                event.target.onerror = null;
            };
            event.target.src = prefix + ".jpeg";
        };
        event.target.src = prefix + ".jpg";
    };
}
