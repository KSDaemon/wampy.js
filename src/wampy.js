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

	var WAMP_ERROR_MSG = {
		SUCCESS:  { code: 0, description: "Success!" },
		URI_ERROR: { code: 1, description: "Topic URI doesn't meet requirements!" },
		NO_BROKER: { code: 2, description: "Server doesn't provide broker role!" },
		NO_CALLBACK_SPEC: { code: 3, description: "No required callback function specified!" },
		NON_EXIST_SUBSCRIBE_CONFIRM: { code: 4, description: "Received subscribe confirmation to non existent subscription!" },
		NON_EXIST_SUBSCRIBE_ERROR: { code: 5, description: "Received error for non existent subscription!" },
		NON_EXIST_UNSUBSCRIBE: { code: 6, description: "Trying to unsubscribe from non existent subscription!" },
		NON_EXIST_SUBSCRIBE_UNSUBSCRIBED: { code: 7, description: "Received unsubscribe confirmation to non existent subscription!" },
		NON_EXIST_PUBLISH_ERROR: { code: 8, description: "Received error for non existent publication!" },
		NON_EXIST_PUBLISH_PUBLISHED: { code: 9, description: "Received publish confirmation for non existent publication!" },
		NON_EXIST_SUBSCRIBE_EVENT: { code: 10, description: "Received event for non existent subscription!" },
		NO_DEALER: { code: 11, description: "Server doesn't provide dealer role!" },
		NON_EXIST_CALL_RESULT: { code: 12, description: "Received rpc result for non existent call!" },
		NON_EXIST_CALL_ERROR: { code: 13, description: "Received rpc call error for non existent call!" }
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
				caller: {}/*,
				callee: {}*/
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
			 * Status of last operation
			 */
			opStatus: { code: 0, description: 'Success!' },

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
		this._wsQueue = [];

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
			this._wsQueue.push(this._encode(msg));
		}

		if (this._isInitialized && this._ws.readyState === 1) {
			while (this._wsQueue.length) {
				this._ws.send(this._wsQueue.shift());
			}
		}
	};

	/**
	 * Reset internal state and cache
	 * @private
	 */
	Wampy.prototype._resetState = function () {
		this._wsQueue = [];
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

		//TODO Check the protocols selected by the server
		// this._ws.protocol

		//TODO Make somewhere a URI check for the realm specified in options

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
		var data, id, i, d;

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
					case WAMP_MSG_SPEC.UNSUBSCRIBE:
						if(this._requests[data[2]]) {

							if(this._requests[data[2]].callbacks.onError) {
								this._requests[data[2]].callbacks['onError'](data[4]);
							}

							delete this._requests[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_ERROR;
						}
						break;
					case WAMP_MSG_SPEC.PUBLISH:
						if(this._requests[data[2]]) {

							if(this._requests[data[2]].callbacks.onError) {
								this._requests[data[2]].callbacks['onError'](data[4]);
							}

							delete this._requests[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_PUBLISH_ERROR;
						}
						break;
					case WAMP_MSG_SPEC.REGISTER:
						break;
					case WAMP_MSG_SPEC.UNREGISTER:
						break;
					case WAMP_MSG_SPEC.INVOCATION:
						break;
					case WAMP_MSG_SPEC.CALL:
						if(this._calls[data[2]]) {

							switch (data.length) {
								case 5:
									// WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict, Error|uri]
									d = null;
									break;
								case 6:
									// WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict, Error|uri, Arguments|list]
									d = data[5];
									break;
								case 7:
									// WAMP SPEC: [ERROR, CALL, CALL.Request|id, Details|dict, Error|uri, Arguments|list, ArgumentsKw|dict]
									d = data[6];
									break;
							}

							this._calls[data[2]]['onError'](d);
							delete this._calls[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_CALL_ERROR;
						}

						break;
				}
				break;
			case WAMP_MSG_SPEC.SUBSCRIBED:
				// WAMP SPEC: [SUBSCRIBED, SUBSCRIBE.Request|id, Subscription|id]
				if(this._requests[data[1]]) {
					this._subscriptions[this._requests[data[1]].topic] = this._subscriptions[data[2]] = {
						id: data[2],
						callbacks: [this._requests[data[1]].callbacks.onEvent]
					};

					if(this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_CONFIRM;
				}
				break;
			case WAMP_MSG_SPEC.UNSUBSCRIBED:
				// WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
				if(this._requests[data[1]]) {
					id = this._subscriptions[this._requests[data[1]].topic].id;
					delete this._subscriptions[this._requests[data[1]].topic];
					delete this._subscriptions[id];

					if(this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];
				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_UNSUBSCRIBED;
				}
				break;
			case WAMP_MSG_SPEC.PUBLISHED:
				// WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
				if(this._requests[data[1]]) {
					if(this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_PUBLISH_PUBLISHED;
				}
				break;
			case WAMP_MSG_SPEC.EVENT:
				if(this._subscriptions[data[1]]) {

					switch (data.length) {
						case 4:
							// WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id, Details|dict]
							d = null;
							break;
						case 5:
							// WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id, Details|dict, PUBLISH.Arguments|list]
							d = data[4];
							break;
						case 6:
							// WAMP SPEC: [EVENT, SUBSCRIBED.Subscription|id, PUBLISHED.Publication|id, Details|dict, PUBLISH.Arguments|list, PUBLISH.ArgumentKw|dict]
							d = data[5];
							break;

					}

					i = this._subscriptions[data[1]].callbacks.length;
					while (i--) {
						this._subscriptions[data[1]].callbacks[i](d);
					}

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_EVENT;
				}
				break;
			case WAMP_MSG_SPEC.RESULT:
				if(this._calls[data[1]]) {

					switch (data.length) {
						case 3:
							// WAMP SPEC: [RESULT, CALL.Request|id, Details|dict]
							d = null;
							break;
						case 4:
							// WAMP SPEC: [RESULT, CALL.Request|id, Details|dict, YIELD.Arguments|list]
							d = data[3];
							break;
						case 5:
							// WAMP SPEC: [RESULT, CALL.Request|id, Details|dict, YIELD.Arguments|list, YIELD.ArgumentsKw|dict]
							d = data[4];
							break;
					}

					this._calls[data[1]]['onSuccess'](d);
					delete this._calls[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_CALL_RESULT;
				}
				break;
			case WAMP_MSG_SPEC.REGISTER:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.REGISTERED:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.UNREGISTER:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.UNREGISTERED:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.INVOCATION:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.INTERRUPT:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.YIELD:
				// WAMP SPEC:
				break;
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
	 * Get the status of last operation
	 *
	 * @returns {code, description}
	 *      code: 0 - if operation was successful
	 *      code > 0 - if error occurred
	 *      description contains details about error
	 */
	Wampy.prototype.getOpStatus = function () {
		return this._cache.opStatus;
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
			this._send([WAMP_MSG_SPEC.GOODBYE, {}, "wamp.error.system_shutdown"]);
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;

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
		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;

		return this;
	};

	/**
	 * Subscribe to a topic on a broker
	 *
	 * @param {string} topicURI
	 * @param {function|object} callbacks - if it is a function - it will be treated as published event callback
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called when subscribe would be confirmed
	 *                            onError: will be called if subscribe would be aborted
	 *                            onEvent: will be called on receiving published event }
	 *
	 * @returns {Wampy}
	 */
	Wampy.prototype.subscribe = function (topicURI, callbacks) {
		var reqId;

		if(!this._cache.server_wamp_features.roles.broker) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;
			return this;
		}

		if(!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;
			return this;
		}

		if(typeof callbacks === 'function') {
			callbacks = { onEvent: callbacks};
		} else if(typeof callbacks === 'object' && callbacks.onEvent !== undefined) {

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;
			return this;
		}

		if (!this._subscriptions[topicURI]) {   // no such subscription

			do {
				reqId = generateId();
			} while (reqId in this._requests);

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
			this._send([WAMP_SPEC.SUBSCRIBE, reqId, {}, topicURI]);

		} else {    // already have subscription to this topic
			// There is no such callback yet
			if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
				this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
			}

			if(callbacks.onSuccess) {
				callbacks['onSuccess']();
			}
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		return this;
	};

	/**
	 * Unsubscribe from topic
	 * @param {string} topicURI
	 * @param {function|object} callbacks - if it is a function - it will be treated as published event callback
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called when unsubscribe would be confirmed
	 *                            onError: will be called if unsubscribe would be aborted
	 *                            onEvent: published event callback to remove }
	 * @returns {Wampy}
	 */
	Wampy.prototype.unsubscribe = function (topicURI, callbacks) {
		var reqId, i;

		if (this._subscriptions[topicURI]) {

			do {
				reqId = generateId();
			} while (reqId in this._requests);

			if(typeof callbacks === 'function') {
				callbacks = { onEvent: callbacks};
			}

			if (callbacks.onEvent !== undefined) {
				i = this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent);
				if (i >= 0) {
					this._subscriptions[topicURI].callbacks.splice(i, 1);
				}

				if (this._subscriptions[topicURI].length) {
					// There are another callbacks for this topic
					this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
					return this;
				}
			}

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
			this._send([WAMP_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;
			return this;
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		return this;
	};

	/**
	 * Publish a event to topic
	 * @param {string} topicURI
	 * @param {Array|object} payload - optional parameter.
	 *                      Can be either an array or hash-table
	 * @param {object} callbacks - optional hash table of callbacks:
	 *                          { onSuccess: will be called when publish would be confirmed
	 *                            onError: will be called if publish would be aborted }
	 * @returns {Wampy}
	 */
	Wampy.prototype.publish = function (topicURI, payload, callbacks) {
		var reqId, msg;

		if(!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;
			return this;
		}

		do {
			reqId = generateId();
		} while (reqId in this._requests);

		switch (arguments.length) {
			case 1:
				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
				msg = [WAMP_SPEC.PUBLISH, reqId, {}, topicURI];
				break;
			case 2:
				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
				if(payload instanceof Array) {
					msg = [WAMP_SPEC.PUBLISH, reqId, {}, topicURI, payload];
				} else {    // assume it's a hash-table
					msg = [WAMP_SPEC.PUBLISH, reqId, {}, topicURI, [], payload];
				}
				break;
			default:
				this._requests[reqId] = {
							topic: topicURI,
							callbacks: callbacks
						};

				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
				if(payload instanceof Array) {
					msg = [WAMP_SPEC.PUBLISH, reqId, { acknowledge: true }, topicURI, payload];
				} else {    // assume it's a hash-table
					msg = [WAMP_SPEC.PUBLISH, reqId, { acknowledge: true }, topicURI, [], payload];
				}
				break;
		}

		this._send(msg);
		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		return this;
	};

	/**
	 * Remote Procedure Call
	 * @param {string} topicURI
	 * @param {Array|object} payload - can be either an array or hash-table or null
	 * @param {function|object} callbacks - if it is a function - it will be treated as result callback function
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called with result on successful call
	 *                            onError: will be called if invocation would be aborted }
	 * @returns {Wampy}
	 */
	Wampy.prototype.call = function (topicURI, payload, callbacks) {
		var reqId, msg;

		if(!this._cache.server_wamp_features.roles.dealer) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;
			return this;
		}

		if(!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;
			return this;
		}

		if(typeof callbacks === 'function') {
			callbacks = { onSuccess: callbacks};
		} else if(typeof callbacks === 'object' && callbacks.onSuccess !== undefined) {

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;
			return this;
		}

		do {
			reqId = generateId();
		} while (reqId in this._requests || reqId in this._calls);

		this._calls[reqId] = callbacks;


		//WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
		if(!payload) {
			msg = [WAMP_SPEC.CALL, reqId, {}, topicURI];
		} else {
			if(payload instanceof Array) {
				msg = [WAMP_SPEC.CALL, reqId, {}, topicURI, payload];
			} else {    // assume it's a hash-table
				msg = [WAMP_SPEC.CALL, reqId, {}, topicURI, [], payload];
			}
		}

		this._send(msg);
		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		return this;
	};


	window.Wampy = Wampy;

})(window);
