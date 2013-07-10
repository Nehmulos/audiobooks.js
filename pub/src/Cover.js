function Cover() {
    
}

Cover.createElement = function(path, captionText) {
    var jewelDiv = document.createElement("div");
    jewelDiv.className = "JewelCase";
    
    var jewelAnchor = document.createElement("a");
    jewelAnchor.href= "#!" + path;

    var coverPath = "books" + path + "cover";
    var jewelCoverImage = document.createElement("img");
    jewelCoverImage.className = "Cover";
    jewelCoverImage.onerror = Utils.multiPostfixCoverFunction(coverPath);
    jewelCoverImage.src = coverPath + ".png";
    jewelAnchor.appendChild(jewelCoverImage);
    
    var overlay = document.createElement("img");
    overlay.className = "CoverOverlay";
    overlay.src = "img/coverOverlay_old.png";
    jewelAnchor.appendChild(overlay);
    
    var caption = document.createElement("span");
    caption.className="Caption";
    caption.innerText = captionText;
    jewelAnchor.appendChild(caption);
    
    jewelDiv.appendChild(jewelAnchor);
    return jewelDiv;
}
