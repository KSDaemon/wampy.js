/**
 * Project: wampy.js
 *
 * https://github.com/KSDaemon/wampy.js
 *
 * A lightweight client-side implementation of
 * WAMP (The WebSocket Application Messaging Protocol)
 * http://wamp.ws
 *
 * Provides asynchronous RPC/PubSub over WebSocket.
 *
 * Copyright 2014 KSDaemon. Licensed under the MIT License.
 * See license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

;(function(window, undefined) {

	var WAMP_SPEC = {
		TYPE_ID_WELCOME: 0,
		TYPE_ID_PREFIX: 1,
		TYPE_ID_CALL: 2,
		TYPE_ID_CALLRESULT: 3,
		TYPE_ID_CALLERROR: 4,
		TYPE_ID_SUBSCRIBE: 5,
		TYPE_ID_UNSUBSCRIBE: 6,
		TYPE_ID_PUBLISH: 7,
		TYPE_ID_EVENT: 8
	};

	function getServerUrl (url) {
		var scheme, port, path;

		if (!url) {
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			port = window.location.port !== "" ? ':' + window.location.port : '';
			return scheme + window.location.hostname + port + "/ws";
		} else if (/^ws/.test(url)) {   // ws scheme is specified
			return url;
		} else if (/:\d{1,5}/.test(url)) {  // port is specified
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			return scheme + url;
		} else {    // just path on current server
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			port = window.location.port !== "" ? ':' + window.location.port : '';
			path = url[0] === '/' ? url : '/' + url;
			return scheme + window.location.hostname + port + path;
		}
	};

	function generateId () {
		var keyChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
			keyLen = 16,
			key = "",
			l = keyChars.length;

		while (keyLen--) {
			key += keyChars.charAt(Math.floor(Math.random() * l));
		}
		return key;
	};

	function getWebSocket (url, protocols) {
		var parsedUrl = getServerUrl(url);

		if ("WebSocket" in window) {
		// Chrome, MSIE, newer Firefox
			if (protocols) {
				return new WebSocket(parsedUrl, protocols);
			} else {
				return new WebSocket(parsedUrl);
			}
		} else if ("MozWebSocket" in window) {
			// older versions of Firefox
			if (protocols) {
				return new MozWebSocket(parsedUrl, protocols);
			} else {
				return new MozWebSocket(parsedUrl);
			}
		} else {
			return null;
		}
	};

	/**
	 * Prefixes table object
	 */
	var prefixMap = function () {
		this._pref2uri = {};
		this._uri2pref = {};
	};

	prefixMap.prototype.get = function (prefix) {
		return this._pref2uri[prefix];
	};

	prefixMap.prototype.set = function (prefix, uri) {
		this._pref2uri[prefix] = uri;
		this._uri2pref[prefix] = uri;
	}

	prefixMap.prototype.remove = function (prefix) {
		if (this._pref2uri[prefix]) {
			delete this._uri2pref[this._pref2uri[prefix]];
			delete this._pref2uri[prefix];
		}
	};

	prefixMap.prototype.reset = function () {
		this._pref2uri = {};
		this._uri2pref = {};
	};

	prefixMap.prototype.resolve = function (curie) {
		var i = curie.indexOf(":"), prefix;

		if (i >= 0) {
			prefix = curie.substring(0, i);
			if (this._pref2uri[prefix]) {
				return this._pref2uri[prefix] + curie.substring(i + 1);
			} else {
				return null;
			}
		} else {
			return curie;
		}
	};

	/**
	 * WAMP Client Class
	 * @param {string} url
	 * @param {Array} protocols
	 * @param {Object} options
	 */
	var Wampy = function (url, protocols, options) {

		/**
		 * WS Url
		 * @type {string}
		 * @private
		 */
		this._url = url;

		/**
		 * WS protocols
		 * @type {Array}
		 * @private
		 */
		this._protocols = [];

		/**
		 * Internal cache for object lifetime
		 * @type {Object}
		 * @private
		 */
		this._cache = {
			/**
			 * WAMP Session ID
			 * @type {string}
			 */
			sessionId: null,

			/**
			 * WAMP Protocol version
			 * @type {number}
			 */
			protocolVersion: 1,

			/**
			 * Timer for reconnection
			 * @type {null}
			 */
			timer: null,

			/**
			 * Reconnection attempts
			 * @type {number}
			 */
			reconnectingAttempts: 0,

			/**
			 * Did we received welcome message
			 * @type {boolean}
			 */
			welcome: false
		};

		/**
		 * WAMP Server info
		 * @type {string}
		 * @private
		 */
		this._serverIdent = null;

		/**
		 * WebSocket object
		 * @type {Object}
		 * @private
		 */
		this._ws = null;

		/**
		 * WS State
		 * @type {boolean}
		 * @private
		 */
		this._isConnected = false;

		/**
		 * Options hash-table
		 * @type {Object}
		 * @private
		 */
		this._options = {
			autoReconnect: true,
			reconnectInterval: 2 * 1000,
			maxRetries: 25
		};

		/**
		 * Prefixes hash-table for instance
		 * @type {prefixMap}
		 * @private
		 */
		this._prefixMap = new prefixMap();

		switch (arguments.length) {
			case 1:
				if (typeof arguments[0] === 'string') {
					this._ws = getWebSocket(arguments[0]);
				} else {
					this._options = this._merge(this._options, arguments[0]);
				}
				break;
			case 2:
				if (typeof arguments[0] === 'string' && arguments[1] instanceof Array) {
					this._protocols = arguments[1];
					this._ws = getWebSocket(arguments[0], arguments[1]);
				} else {
					this._ws = getWebSocket(arguments[0]);
					this._options = this._merge(this._options, arguments[1]);
				}
				break;
			case 3:
				this._protocols = arguments[1];
				this._ws = getWebSocket(arguments[0], arguments[1]);
				this._options = this._merge(this._options, arguments[2]);
				break;
		}

		this._initWsCallbacks();
	};

	/* Internal utils methods */

	/**
	 * Merge argument objects in first on
	 * @returns {Object}
	 * @private
	 */
	Wampy.prototype._merge = function () {
		var obj = {}, i, l = arguments.length, attr;

		for (i = 0; i < l; i++) {
			for (attr in arguments[i]) {
				obj[attr] = arguments[i][attr];
			}
		}

		return obj;
	};

	/* Internal websocket object functions */
	Wampy.prototype._initWsCallbacks = function () {
		var self = this;

		this._ws.onopen = function () { self._wsOnOpen.call(self); };
		this._ws.onclose = function (event) { self._wsOnClose.call(self, event); };
		this._ws.onmessage = function (event) { self._wsOnMessage.call(self, event); };
		this._ws.onerror = function (error) { self._wsOnError.call(self, error); };

	};

	Wampy.prototype._wsOnOpen = function () {
		console.log("[wampy] websocket connected");

		this._isConnected = true;

		if (this._options.onConnect) {
			this._options.onConnect();
		}
	};

	Wampy.prototype._wsOnClose = function (event) {
		var self = this;
		console.log("[wampy] websocket disconnected");

		this._cache.welcome = false;

		// Automatic reconnection
		if (this._isConnected && this._options.autoReconnect && this._cache.reconnectingAttempts < this._options.maxRetries) {
			this._timer = window.setTimeout(function () { self._wsReconnect.call(self); }, this._options.reconnectInterval);
		} else {
			// No reconnection needed or reached max retries count
			this._isConnected = false;

			if (this._options.onClose) {
				this._options.onClose();
			}
		}
	};

	Wampy.prototype._wsOnMessage = function (event) {
		var data;

		console.log("[wampy] websocket message received: ", event.data);

		data = JSON.parse(event.data);

		switch (data[0]) {
			case WAMP_SPEC.TYPE_ID_WELCOME:
				if (this._cache.welcome) {
					console.log("[wampy] Received WELCOME message, while already initialized!");
				}
				this._cache.sessionId = data[1];
				this._cache.protocolVersion = data[2];
				this._serverIdent = data[3];
				break;
			case WAMP_SPEC.TYPE_ID_CALLRESULT:

				break;
			case WAMP_SPEC.TYPE_ID_CALLERROR:

				break;
			case WAMP_SPEC.TYPE_ID_EVENT:

				break;
		}

	};

	Wampy.prototype._wsOnError = function (error) {
		console.log("[wampy] websocket error");

		if (this._options.onError) {
			this._options.onError();
		}
	};

	Wampy.prototype._wsReconnect = function () {
		console.log("[wampy] websocket reconnecting...");

		if (this._options.onReconnect) {
			this._options.onReconnect();
		}

		this._cache.reconnectingAttempts++;
		this._ws = getWebSocket(this._url, this._protocols);
		this._initWsCallbacks();
	};

	/* Wampy public API */

	Wampy.prototype.options = function (opts) {
		if (!opts) {
			return this._options;
		} else if (typeof opts === 'object') {
			this._options = this._merge(this._options, opts);
		}
	};

	Wampy.prototype.connect = function (url, protocols) {
		if (url) {
			this._url = url;
		}

		if (protocols instanceof Array) {
			this._protocols = protocols;
		} else {
			this._protocols = [];
		}

		this._ws = getWebSocket(this._url, this._protocols);
	};

	Wampy.prototype.disconnect = function () {
		this._isConnected = false;
		this._ws.close();
		this._cache.timer = null;
		this._cache.sessionId = null;
		this._cache.reconnectingAttempts = 0;
		this._serverIdent = null;
		this._prefixMap.reset();
		this._ws = null;
	};

	Wampy.prototype.prefix = function (prefix, uri) {
		this._prefixMap.set(prefix, uri);
	};

	Wampy.prototype.unprefix = function (prefix) {
		this._prefixMap.remove(prefix);
	};

	Wampy.prototype.call = function (procURI, callRes, callErr) {

	};

	Wampy.prototype.subscribe = function (topicURI, callback) {

	};
	Wampy.prototype.unsubscribe = function (topicURI, callback) {

	};

	Wampy.prototype.publish = function (topicURI, event, exclude, eligible) {

	};

	window.Wampy = Wampy;

})(window);
