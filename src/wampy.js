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
		} else if (/^ws/.test(url)) {   // scheme is specified
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
		if ("WebSocket" in window) {
		// Chrome, MSIE, newer Firefox
			if (protocols) {
				return new WebSocket(url, protocols);
			} else {
				return new WebSocket(url);
			}
		} else if ("MozWebSocket" in window) {
			// older versions of Firefox
			if (protocols) {
				return new MozWebSocket(url, protocols);
			} else {
				return new MozWebSocket(url);
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
		 * WAMP Session ID
		 * @type {string}
		 * @private
		 */
		this._sessionId = null;

		/**
		 * WAMP Server info
		 * @type {string}
		 * @private
		 */
		this._serverIdent = null;

		/**
		 * WAMP Protocol version
		 * @type {number}
		 * @private
		 */
		this._protocolVersion = 1;

		/**
		 * WebSocket object
		 * @type {Object}
		 * @private
		 */
		this._ws = null;

		/**
		 * Options hash-table
		 * @type {Object}
		 * @private
		 */
		this._options = {};

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
					this._options = arguments[0];
				}
				break;
			case 2:
				if (typeof arguments[0] === 'string' && arguments[1] instanceof Array) {
					this._ws = getWebSocket(arguments[0], arguments[1]);
				} else {
					this._ws = getWebSocket(arguments[0]);
					this._options = arguments[1];
				}
				break;
			case 3:
				this._ws = getWebSocket(arguments[0], arguments[1]);
				this._options = arguments[2];
				break;
		}
	};

	Wampy.prototype.connect = function (url, protocols) {
		this._ws = getWebSocket(url, protocols);
	};

//	Wampy.prototype.welcome = function (sessionId , protocolVersion, serverIdent) {
//		this._sessionId = sessionId;
//		this._protocolVersion = protocolVersion;
//		this._serverIdent = serverIdent;
//	};

	Wampy.prototype.prefix = function (prefix, uri) {
		this._prefixMap.set(prefix, uri);
	};

	Wampy.prototype.call = function (procURI, callRes, callErr) {

	};

	Wampy.prototype.subscribe = function (topicURI, callback) {

	};
	Wampy.prototype.unsubscribe = function (topicURI) {

	};

	Wampy.prototype.publish = function (topicURI, event, exclude, eligible) {

	};

	window.Wampy = Wampy;

})(window);
