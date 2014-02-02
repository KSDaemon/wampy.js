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

;(function(window, document, undefined) {

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

	var wampy = function (url, protocols) {

		this._ws = null;

		if(url) {
			this._ws = getWebSocket(url, protocols);
		}



	};

	wampy.prototype.connect = function (url, protocols) {
		this._ws = getWebSocket(url, protocols);
	};

	window.wampy = wampy;

})(window, document);
