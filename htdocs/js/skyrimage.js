var skyrimage = (function () {

// Utils/lib

var getNode = function (id) {
	return document.getElementById(id);
};

var px = function (coord) {
	return (coord + "px");
};

var random = function (min, max) {
	return (Math.round(Math.random() * (max - min)) + min);
};

var setOpacity = function (node, opacity) {
	// IE 8
	node.style["-ms-filter"] = "progid:DXImageTransform.Microsoft.Alpha(Opacity="+ (opacity * 100) +")";

	// IE 5-7
	node.style["filter"] = "alpha(opacity="+ (opacity * 100) +")";

	// Gecko
	node.style["-moz-opacity"] = opacity;

	// Safari 1.x
	node.style["-khtml-opacity"] = opacity;

	// Everyone else
	node.style.opacity = opacity;
};

var sprintf = function(str) {
	for (var i = 1; i < arguments.length; ++i) {
		str = str.replace(/%s/, arguments[i]);
	}

	return str;
};

var xhr = function(method, url, data, callbacks) {
	var callbacks = (callbacks || {});

	// Find out what kind of XHR object we need
	try {
		var req = new XMLHttpRequest();
	} catch(e) {
		var types = [
			"MXSML2.XMLHTTP3.0",
			"MXSML2.XMLHTTP",
			"Microsoft.XMLHTTP"
		];

		for (var i = 0; i < types.length; i++) {
			try {
				req = new ActiveXObject(types[i]);
				break;
			} catch(e) {}
		}
	}

	req.open(method, url, true);

	if (method.toUpperCase() == "POST") {
		var post = "";

		for (var i in data) {
			// For arrays, we need to iterate through each member.
			if ((typeof(data[i]) == "object") && data[i].length) {
				for (var a = 0; a < data[i].length; a++) {
					post += sprintf("%s[]=%s&", i, encodeURIComponent(data[i][a]));
				}
			} else {
				post += sprintf("%s=%s&", i, encodeURIComponent(data[i]));
			}
		}

		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	} else {
		req.setRequestHeader("Content-Type", "application/x-javascript");
	}

	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if (callbacks.complete) callbacks.complete(req);

			if (req.status == 200) {
				if (callbacks.success) callbacks.success(req.responseText);
			} else {
				if (callbacks.error) callbacks.error(req.status);
			}
		}
	};

	req.send(post || null);
};

// RAF shim
if (!window.requestAnimationFrame) {
	window.requestAnimationFrame = (function () {
		return window.webkitRequestAnimationFrame
			|| window.oRequestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.msRequestAnimationFrame
			|| function (callback, element) {
				setTimeout(callback, (1000 / 60));
			};
	}());
}

// Image

var image = (function () {
	var MIN_SCALE = 0.5;
	var MAX_SCALE = 2.5;

	var cache = {};
	var centerX = parseInt(window.innerWidth / 4);
	var centerY = parseInt(window.innerHeight / 2);
	var currentImage = {};
	var deg;
	var fadingOut = false;
	var keysDown = {};
	var opacity;
	var scale;
	var zoomIn;

	addEventListener("keydown", function (e) {
		keysDown[e.keyCode] = true;

		// Prevent up/down keys from scrolling
		switch (e.keyCode) {
			case 38:
			case 40:
				e.preventDefault();
				break;
		}
	}, false);

	addEventListener("keyup", function (e) {
		delete keysDown[e.keyCode];
	}, false);

	var onload = function (src) {
		var image = cache[src];
		image.loaded = true;
		image.width = image.node.width;
		image.height = image.node.height;

		setPosition();
	};

	var setPosition = function () {
		var node = currentImage.node;
		node.style.width = px(currentImage.width * scale);
		node.style.height = px(currentImage.height * scale);
		node.style.left = px(centerX - (currentImage.width / 2) * scale);
		node.style.top = px(centerY - (currentImage.height / 2) * scale);
	};

	return {
		fade: function (fadeOut) {
			fadingOut = fadeOut;
		},
		getPosition: function () {
			return {
				x: (centerX - (currentImage.node.width / 2)),
				y: (centerY - (currentImage.node.height / 2))
			};
		},
		set: function (src) {
			deg = 0;
			opacity = 0;
			scale = MIN_SCALE;
			zoomIn = true;

			for (var key in cache) {
				cache[key].node.className = "hidden";
			}

			if (src in cache) {
				currentImage = cache[src];
				var node = currentImage.node;
				node.className = "";
			} else {
				var node = new Image();
				node.onload = function () {
					onload(src);
				};
				node.src = src;
				document.body.appendChild(node);

				currentImage = cache[src] = {
					node: node
				};
			}

			setOpacity(node, opacity);
		},
		update: function (dt) {
			if (currentImage.loaded) {
				var node = currentImage.node;

				if (fadingOut) {
					opacity -= (dt / 500);
					if (opacity < 0) {
						opacity = 0;
					}
					setOpacity(node, opacity);
					return;
				}

				// Opacity
				if (opacity < 1) {
					opacity += (dt / 1000);
					setOpacity(node, opacity);
				}

				// Scale and position
				var zoomInRightNow = zoomIn;
				if (keysDown[38]) {
					zoomInRightNow = true;
				} else if (keysDown[40]) {
					zoomInRightNow = false;
				}

				var speed = (dt / 75000);
				if (zoomInRightNow) {
					if (keysDown[38]) {
						speed *= 5;
					}
					scale += speed;
					if (scale > MAX_SCALE) {
						scale = MAX_SCALE;
					}
				} else {
					if (keysDown[40]) {
						speed *= 5;
					}
					scale -= speed;
					if (scale < MIN_SCALE) {
						scale = MIN_SCALE;
					}
				}

				setPosition();

				// Rotation
				var max = 60;
				var speed = (dt / 50);
				if (keysDown[37]) {
					deg -= speed; // Left
					if (deg < -max) {
						deg = -max;
					}
				} else if (keysDown[39]) {
					deg += speed; // Right
					if (deg > max) {
						deg = max;
					}
				}

				node.style["-moz-transform"] = sprintf("rotateY(%sdeg)", deg);
				node.style["-webkit-transform"] = sprintf("rotateY(%sdeg)", deg);
			}
		}
	};
}());

// Fog

var fogEmitter = (function () {
	var MAX_FOGS = 15;

	var active = true;
	var fogIndex = 0;
	var fogs = {};
	var fogTimer = 0;
	var numFogs = 0;

	return {
		activate: function () {
			active = true;
		},
		deactivate: function () {
			active = false;
		},
		update: function (dt) {
			if (!active) {
				return;
			}

			fogTimer -= dt;
			if (fogTimer < 0) {
				fogTimer = random(350, 1250);

				if (numFogs < MAX_FOGS) {
					fogs["_" + fogIndex] = new Fog();
					++fogIndex;
					++numFogs;
				}
			}

			for (var id in fogs) {
				var fog = fogs[id];
				fog.update(dt);

				if (fog.expired()) {
					fog.remove();
					delete fogs[id];

					--numFogs;
				}
			}
		}
	};
}());

var Fog = function () {
	var FOG_SIZE = 400;

	this._fadeIn = true;
	this._opacity = 0;
	this._elapsed = 0;
	this._velocity = {
		x: random(3, 15),
		y: -random(3, 15)
	};
	this._ttl = random(3000, 10000);
	this._x = random(-FOG_SIZE, (window.innerWidth / 2));
	this._y = random(window.innerHeight, window.innerHeight / 2);

	this._node = document.createElement("div");
	this._node.className = ("fog fog-" + random(1, 4));
	this._node.style.zIndex = random(1, 5);
	document.body.appendChild(this._node);

	this.update(0);
};

Fog.prototype.expired = function () {
	return (this._elapsed > this._ttl);
};

Fog.prototype.remove = function () {
	this._node.parentNode.removeChild(this._node);
};

Fog.prototype.update = function (dt) {
	var MAX_OPACITY = 0.5;
	if (this._fadeIn) {
		this._opacity += (dt / 25000);

		if (this._opacity >= MAX_OPACITY) {
			this._fadeIn = false;
			this._opacity = MAX_OPACITY;
		}
	} else {
		this._elapsed += dt;
		this._opacity = (((this._ttl - this._elapsed) / this._ttl) * MAX_OPACITY);
	}
	setOpacity(this._node, this._opacity);

	var mod = (dt / 1000);
	this._x += (this._velocity.x * mod);
	this._y += (this._velocity.y * mod);
	this._node.style.left = px(this._x);
	this._node.style.top = px(this._y);
};

// Text

var text = (function () {
	var fadingOut = false;
	var node = getNode("text");
	var opacity;

	return {
		fade: function (fadeOut) {
			fadingOut = fadeOut;
		},
		set: function (text) {
			node.innerHTML = text
			opacity = 0;
			setOpacity(node, opacity);
		},
		update: function (dt) {
			if (fadingOut) {
				opacity -= (dt / 500);
				if (opacity < 0) {
					opacity = 0;
				}
				setOpacity(node, opacity);
				return;
			}

			if (opacity < 1) {
				opacity += (dt / 2500);
				setOpacity(node, opacity);
			}
		}
	};
}());

// Share

var shareModal = (function () {
	var TWEET_URL = [
		"https://twitter.com/intent/tweet",
		"?original_referer=http%3A%2F%2Fwww.skyrimage.com%2F",
		"&text=I+made+an+image+EPIC+on+Skyrimage%21",
		"&url=",
	].join("");

	var node = getNode("share-modal");
	var urlNode = getNode("share-url");

	var show = function () {
		node.style.top = "100px";
	};

	var hide = function () {
		node.style.top = "-300px";
	};

	var toggle = function () {
		if (node.style.top == "100px") {
			hide();
		} else {
			show();
		}
	};

	getNode("nav-share").addEventListener("click", function (e) {
		e.preventDefault();
		toggle();
	}, false);

	getNode("share-tweet").addEventListener("click", function () {
		location.href = (TWEET_URL + location.href.replace(/#/, '%23'));
	}, false);

	getNode("share-close").addEventListener("click", function () {
		hide();
	}, false);

	return {
		setURL: function (url) {
			urlNode.href = url;
			urlNode.innerHTML = url;
		}
	};
}());

// Create

var createModal = (function () {
	var creating = false;
	var node = getNode("create-modal");
	var saving = false;

	var inputsContainer = getNode("inputs");
	var imageInput = getNode("input-image");
	var textInput = getNode("input-text");

	var show = function () {
		// Reset
		imageInput.value = "";
		textInput.value = "";

		node.style.bottom = "-100px";
		fogEmitter.deactivate();

		// Fade out current skyrimage
		image.fade(true);
		var position = image.getPosition();
		imageInput.style.left = px(position.x);
		imageInput.style.top = px(position.y);
		text.fade(true);

		// Hide the inputs
		inputsContainer.className = "";
	};

	var hide = function () {
		fogEmitter.activate();
		image.fade(false);
		text.fade(false);
		inputsContainer.className = "hidden";
		node.style.bottom = "-210px";
	};

	var validate = function () {
		return (!imageInput.value || !textInput.value);
	};

	getNode("nav-create").addEventListener("click", function (e) {
		e.preventDefault();
		if (node.style.bottom == "-100px") {
			hide();
		} else {
			show();
		}
	}, false);

	getNode("create-save").addEventListener("click", function (e) {
		if (saving) {
			return;
		}

		if (!validate()) {
			showError("Please include an image URL and some text.");
			return;
		}

		saving = true;

		xhr("POST", "/create/", {
			src: imageInput.value,
			text: textInput.value
		}, {
			complete: function () {
				saving = false;
			},
			error: function (e) {
				showError("Sorry, an error occurred: " + e);
			},
			success: function (e) {
				hide();

				var json = JSON.parse(e);
				set(json.row);
			}
		});
	}, false);

	getNode("create-cancel").addEventListener("click", function (e) {
		hide();
	}, false);
}());

// Error

var showError = function (message) {
	alert(message);
};

/*
var (error = function () {
}();

var errorNode = getNode("error");
var showError = function (message) {
	errorNode.className = "";
	setOpacity(errorNode, 1);
	errorNode.innerHTML = message;

	errorNode.className = "fade-out";
	setOpacity(errorNode, 0);
};
*/

// Random

(function () {
	var fetching = false;
	var rowIndex = 0;
	var rows = [];

	var fetch = function (callback) {
		if (fetching) {
			return;
		}

		fetching = true;

		xhr("GET", "/random/", {}, {
			complete: function () {
				fetching = false;
			},
			error: function (e) {
				showError("Sorry, an error occurred: " + e);
			},
			success: function (e) {
				rowIndex = 0;
				rows = JSON.parse(e);
				callback();
			}
		});
	};

	var showNext = function () {
		set(rows[rowIndex]);

		if (++rowIndex >= (rows.length - 1)) {
			rowIndex = 0;
		}
	};

	getNode("nav-random").addEventListener("click", function (e) {
		e.preventDefault();

		if (rows.length) {
			showNext();
		} else {
			fetch(showNext);	
		}
	}, false);
}());

// Google ads

getNode("google-hide").addEventListener("click", function () {
	getNode("google-ad").style.display = "none";
}, false);

// Main loop

var dt = 0;
var lastTime = Date.now();
var main = function () {
	var now = Date.now();
	dt = (now - lastTime);

	image.update(dt);
	fogEmitter.update(dt);
	text.update(dt);

	lastTime = now;

	requestAnimationFrame(arguments.callee);
};
main();

var set = function (row) {
	location.href = ("#" + row.id);

	shareModal.setURL(location.href);
	image.set(row.src);
	text.set(row.text);
};

var setById = function (id) {
	xhr("GET", "/id/?id=" + id, {}, {
		success: function (e) {
			row = JSON.parse(e);
			image.set(row.src);
			text.set(row.text);
		}
	});
};

return {
	set: set,
	setById: setById
};

}());
