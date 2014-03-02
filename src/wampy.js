/**
 * Project: wampy.js
 *
 * https://github.com/KSDaemon/wampy.js
 *
 * A lightweight client-side implementation of
 * WAMP (The WebSocket Application Messaging Protocol v2)
 * http://wamp.ws
 *
 * Provides asynchronous RPC/PubSub over WebSocket.
 *
 * Copyright 2014 KSDaemon. Licensed under the MIT License.
 * See license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

;(function(window, undefined) {

	var WAMP_MSG_SPEC = {
		HELLO: 1,
		WELCOME: 2,
		ABORT: 3,
		CHALLENGE: 4,
		AUTHENTICATE: 5,
		GOODBYE: 6,
		HEARTBEAT: 7,
		ERROR: 8,
		PUBLISH: 16,
		PUBLISHED: 17,
		SUBSCRIBE: 32,
		SUBSCRIBED: 33,
		UNSUBSCRIBE: 34,
		UNSUBSCRIBED: 35,
		EVENT: 36,
		CALL: 48,
		CANCEL: 49,
		RESULT: 50,
		REGISTER: 64,
		REGISTERED: 65,
		UNREGISTER: 66,
		UNREGISTERED: 67,
		INVOCATION: 68,
		INTERRUPT: 69,
		YIELD: 70
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
		return Math.floor(Math.random() * 9007199254740992);
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
	 * WAMP Client Class
	 * @param {string} url
	 * @param {Object} options
	 */
	var Wampy = function (url, options) {

		/**
		 * Wampy version
		 * @type {string}
		 * @private
		 */
		this.version = 'v2.0.0';

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
		this._protocols = ['wamp.2.json'];

		/**
		 * WAMP features, supported by Wampy
		 * @type {{}}
		 * @private
		 */
		this._wamp_features = {
			roles: {
				publisher: {},
				subscriber: {},
				caller: {},
				callee: {}
			}
		};

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
			 * Server WAMP roles and features
			 */
			server_wamp_features: {},

			/**
			 * Are we in state of saying goodbye
			 * @type {boolean}
			 */
			isSayingGoodbye: false,

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
			 * onConnect callback
			 * @type {function}
			 */
			onConnect: null,

			/**
			 * onClose callback
			 * @type {function}
			 */
			onClose: null,

			/**
			 * onError callback
			 * @type {function}
			 */
			onError: null,

			/**
			 * onReconnect callback
			 * @type {function}
			 */
			onReconnect: null
		};

		/**
		 * WebSocket object
		 * @type {Object}
		 * @private
		 */
		this._ws = null;

		/**
		 * Internal queue for websocket requests, for case of disconnect
		 * @type {Array}
		 * @private
		 */
		this._queue = [];

		/**
		 * Internal queue for wamp requests
		 * @type {object}
		 * @private
		 */
		this._requests = {};

		/**
		 * Stored RPC
		 * @type {object}
		 * @private
		 */
		this._calls = {};

		/**
		 * Stored Pub/Sub
		 * @type {object}
		 * @private
		 */
		this._subscriptions = {};

		/**
		 * Wampy State
		 * @type {boolean}
		 * @private
		 */
		this._isInitialized = false;

		/**
		 * Options hash-table
		 * @type {Object}
		 * @private
		 */
		this._options = {
			autoReconnect: true,
			reconnectInterval: 2 * 1000,
			maxRetries: 25,
			transportEncoding: 'json',
			realm: window.location.hostname
		};

		if(msgpack in window) {
			this._protocols.push('wamp.2.msgpack');
		}

		switch (arguments.length) {
			case 1:
				if (typeof arguments[0] === 'string') {
					this._ws = getWebSocket(arguments[0], this._protocols);
				} else {
					this._options = this._merge(this._options, arguments[0]);
				}
				break;
			case 2:
				this._ws = getWebSocket(arguments[0], this._protocols);
				this._options = this._merge(this._options, arguments[1]);
				break;
			default:
				this._ws = getWebSocket(undefined, this._protocols);
		}

		//TODO Catch if no websocket object

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

	/* Internal websocket related functions */

	/**
	 * Validate uri
	 * @param {string} uri
	 * @returns {boolean}
	 * @private
	 */
	Wampy.prototype._validateURI = function (uri) {
		var re = /^([0-9a-z_]{2,}\.)*([0-9a-z_]{2,})$/;
		if(!re.test(uri) || uri.indexOf('wamp') === 0) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Encode WAMP message
	 * @param {Array} msg
	 * @returns {*}
	 * @private
	 */
	Wampy.prototype._encode = function (msg) {
		if(this._options.transportEncoding === 'msgpack') {
			try {
				return msgpack.pack(msg);
			} catch (e) {
				throw new Error("[wampy] no msgpack encoder available!");
			}
		} else {
			return JSON.stringify(msg);
		}
	};

	/**
	 * Decode WAMP message
	 * @param  msg
	 * @returns {array}
	 * @private
	 */
	Wampy.prototype._decode = function (msg) {
		if(this._options.transportEncoding === 'msgpack') {
			try {
				return msgpack.unpack(msg);
			} catch (e) {
				throw new Error("[wampy] no msgpack encoder available!");
			}
		} else {
			return JSON.parse(msg);
		}
	};

	/**
	 * Send encoded message to server
	 * @param {Array} msg
	 * @private
	 */
	Wampy.prototype._send = function (msg) {
		if(msg) {
			this._queue.push(this._encode(msg));
		}

		if (this._isInitialized && this._ws.readyState === 1) {
			while (this._queue.length) {
				this._ws.send(this._queue.shift());
			}
		}
	};

	/**
	 * Reset internal state and cache
	 * @private
	 */
	Wampy.prototype._resetState = function () {
		this._queue = [];
		this._subscriptions = {};
		this._requests = {};
		this._calls = {};

		// Just keep attrs that are have to be present
		this._cache = {
			reconnectingAttempts: 0
		};
	};

	/**
	 * Initialize internal websocket callbacks
	 * @private
	 */
	Wampy.prototype._initWsCallbacks = function () {
		var self = this;

		this._ws.onopen = function () { self._wsOnOpen.call(self); };
		this._ws.onclose = function (event) { self._wsOnClose.call(self, event); };
		this._ws.onmessage = function (event) { self._wsOnMessage.call(self, event); };
		this._ws.onerror = function (error) { self._wsOnError.call(self, error); };

	};

	Wampy.prototype._wsOnOpen = function () {
		console.log("[wampy] websocket connected");

		//TODO Make a URI check for the realm specified in options

		// WAMP SPEC: [HELLO, Realm|uri, Details|dict]
		this._send([WAMP_MSG_SPEC.HELLO, this._options.realm, this._wamp_features]);
	};

	Wampy.prototype._wsOnClose = function (event) {
		var self = this;
		console.log("[wampy] websocket disconnected");

		// Automatic reconnection
		if (this._cache.sessionId && this._options.autoReconnect && this._cache.reconnectingAttempts < this._options.maxRetries) {
			this._cache.timer = window.setTimeout(function () { self._wsReconnect.call(self); }, this._options.reconnectInterval);
		} else {
			// No reconnection needed or reached max retries count
			if (this._options.onClose) {
				this._options.onClose();
			}

			this._resetState();
			this._ws = null;
		}
	};

	Wampy.prototype._wsOnMessage = function (event) {
		var data;

		console.log("[wampy] websocket message received");

		data = this._decode(event.data);

		switch (data[0]) {
			case WAMP_MSG_SPEC.WELCOME:
				// WAMP SPEC: [WELCOME, Session|id, Details|dict]
				this._cache.sessionId = data[1];
				this._cache.server_wamp_features = data[2];
				break;
			case WAMP_MSG_SPEC.ABORT:
				// WAMP SPEC: [ABORT, Details|dict, Reason|uri]
				if (this._options.onError) {
					this._options.onError(data[1].message ? data[1].message : data[2]);
				}
				this._ws.close();
				break;
			case WAMP_MSG_SPEC.CHALLENGE:

				break;
			case WAMP_MSG_SPEC.GOODBYE:
				// WAMP SPEC: [GOODBYE, Details|dict, Reason|uri]
				if(!this._cache.isSayingGoodbye) {    // get goodbye, initiated by server
					this._send([WAMP_MSG_SPEC.GOODBYE, {}, "wamp.error.goodbye_and_out"]);
				}
				this._cache.sessionId = null;
				this._ws.close();
				break;
			case WAMP_MSG_SPEC.HEARTBEAT:

				break;
			case WAMP_MSG_SPEC.ERROR:
				// WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict, Error|uri, (Arguments|list, ArgumentsKw|dict)]
				switch(data[1]) {
					case WAMP_MSG_SPEC.SUBSCRIBE:
						break;
					case WAMP_MSG_SPEC.UNSUBSCRIBE:
						break;
					case WAMP_MSG_SPEC.PUBLISH:
						break;
					case WAMP_MSG_SPEC.REGISTER:
						break;
					case WAMP_MSG_SPEC.UNREGISTER:
						break;
					case WAMP_MSG_SPEC.INVOCATION:
						break;
					case WAMP_MSG_SPEC.CALL:
						break;
				}
				break;
			case WAMP_MSG_SPEC.SUBSCRIBED:
				// WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
				if(this._requests[data[1]]) {
					this._subscriptions[this._requests[data[1]]].id = data[2];
				}
				break;
			case WAMP_MSG_SPEC.UNSUBSCRIBED:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.PUBLISHED:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.RESULT:

				break;
			case WAMP_MSG_SPEC.REGISTER:

				break;
			case WAMP_MSG_SPEC.REGISTERED:

				break;
			case WAMP_MSG_SPEC.UNREGISTER:

				break;
			case WAMP_MSG_SPEC.UNREGISTERED:

				break;
			case WAMP_MSG_SPEC.INVOCATION:

				break;
			case WAMP_MSG_SPEC.INTERRUPT:

				break;
			case WAMP_MSG_SPEC.YIELD:

				break;




//			case WAMP_SPEC.TYPE_ID_WELCOME:
//				this._cache.sessionId = data[1];
//				this._cache.protocolVersion = data[2];
//				this._serverIdent = data[3];
//				this._isInitialized = true;
//
//				// Firing onConnect event on real connection to WAMP server
//				if (this._options.onConnect) {
//					this._options.onConnect();
//				}
//
//				// Send local queue if there is something out there
//				this._send();
//
//				break;
//			case WAMP_SPEC.TYPE_ID_CALLRESULT:
//				if (this._calls[data[1]] && this._calls[data[1]].callRes) {
//					this._calls[data[1]]['callRes'](data[2]);
//				}
//				break;
//			case WAMP_SPEC.TYPE_ID_CALLERROR:
//				if (this._calls[data[1]] && this._calls[data[1]].callErr) {
//					// I don't think client is interested in URI of error
//					this._calls[data[1]]['callErr'](data[3], data[4]);
//				}
//				break;
//			case WAMP_SPEC.TYPE_ID_EVENT:
//				// Ratchet does not return fully qualified URI for the topic as in spec
//				// so we need to resolve it manually :(
//				uri = this._prefixMap.resolve(data[1]);
//				if (this._subscriptions[uri]) {
//					i = this._subscriptions[uri].length;
//					while (i--) {
//						this._subscriptions[uri][i](data[2]);
//					}
//				}
//				break;
		}

	};

	Wampy.prototype._wsOnError = function (error) {
		console.log("[wampy] websocket error");

		if (this._options.onError) {
			this._options.onError(error);
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

	/**
	 * Get or set Wampy options
	 *
	 * To get options - call without parameters
	 * To set options - pass hash-table with options values
	 *
	 * @param {object} opts
	 * @returns {*}
	 */
	Wampy.prototype.options = function (opts) {
		if (opts === undefined) {
			return this._options;
		} else if (typeof opts === 'object') {
			this._options = this._merge(this._options, opts);
			return this;
		}
	};

	/**
	 * Connect to server
	 * @param {string} url New url (optional)
	 * @returns {Wampy}
	 */
	Wampy.prototype.connect = function (url) {
		if (url) {
			this._url = url;
		}

		this._ws = getWebSocket(this._url, this._protocols);

		return this;
	};

	/**
	 * Disconnect from server
	 * @returns {Wampy}
	 */
	Wampy.prototype.disconnect = function () {
		if (this._cache.sessionId) {
			// need to send goodbye message to server
			this._cache.isSayingGoodbye = true;
			this._send([WAMP_MSG_SPEC.GOODBYE, {}, "wamp.error.close_realm"]);
		}

		return this;
	};

	/**
	 * Abort WAMP session establishment
	 *
	 * @returns {Wampy}
	 */
	Wampy.prototype.abort = function () {

		if(!this._cache.sessionId && this._ws.readyState === 1) {
			this._send([WAMP_MSG_SPEC.ABORT, {}, "wamp.error.abort"]);
		}

		this._ws.close();

		return this;
	};

	/**
	 * Subscribe to a topic on a broker
	 *
	 * @param {string} topicURI
	 * @param {function} callback
	 * @returns {Wampy}
	 */
	Wampy.prototype.subscribe = function (topicURI, callback) {
		var reqId;

		if(!this._cache.server_wamp_features.roles.broker) {
			throw new Error("[wampy] server doesn't provide broker role!");
		}

		if(!this._validateURI(topicURI)) {
			throw new Error("[wampy] topic URI doesn't meet requirements!");
		}

		if (!this._subscriptions[topicURI]) {
			reqId = generateId();
			this._requests[reqId] = topicURI;
			this._subscriptions[topicURI] = {
				id: 0,
				callbacks: [],
				reqId: reqId
			};

			// WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
			this._send([WAMP_SPEC.SUBSCRIBE, reqId, {}, topicURI]);
		}

		// There is no such callback yet
		if (this._subscriptions[topicURI].callbacks.indexOf(callback) < 0) {
			this._subscriptions[topicURI].callbacks.push(callback);
		}

		return this;
	};

//	Wampy.prototype.call = function (procURI, callbacks) {
//		var callId = generateId(), i,
//			l = arguments.length,
//			msg = [WAMP_SPEC.TYPE_ID_CALL];
//
//		// If we've got for some reason nonunique key
//		while (callId in this._calls) {
//			callId = generateId();
//		}
//
//		this._calls[callId] = callbacks;
//
//		msg.push(callId);
//		msg.push(procURI);
//
//		for (i = 2; i < l; i++) {
//			msg.push(arguments[i]);
//		}
//
//		this._send(msg);
//
//		return this;
//	};

//	Wampy.prototype.unsubscribe = function (topicURI, callback) {
//		var i, uri = this._prefixMap.resolve(topicURI);
//
//		if (this._subscriptions[uri]) {
//			if (callback !== undefined) {
//				i = this._subscriptions[uri].indexOf(callback);
//				if (i >= 0) {
//					this._subscriptions[uri].splice(i, 1);
//				}
//
//				if (this._subscriptions[uri].length) {
//					// There are another callbacks for this topic
//					return this;
//				}
//			}
//
//			this._send([WAMP_SPEC.TYPE_ID_UNSUBSCRIBE, topicURI]);
//			delete this._subscriptions[uri];
//		}
//
//		return this;
//	};

//	Wampy.prototype.publish = function (topicURI, event, exclude, eligible) {
//		var msg = [WAMP_SPEC.TYPE_ID_PUBLISH, topicURI, event];
//
//		switch (arguments.length) {
//			case 2:
//				this._send(msg);
//				break;
//			case 3:
//				if ((typeof(exclude) === 'boolean') || (exclude instanceof Array)) {
//					msg.push(exclude);
//					this._send(msg);
//				}
//				break;
//			case 4:
//				if ((exclude instanceof Array) && (eligible instanceof Array)) {
//					msg.push(exclude);
//					msg.push(eligible);
//					this._send(msg);
//				}
//				break;
//		}
//
//		return this;
//	};

	window.Wampy = Wampy;

})(window);
