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
 * See @license text at http://www.opensource.org/licenses/mit-license.php
 *
 */

;( // Module boilerplate to support browser globals and browserify and AMD.
	typeof define === 'function' ? function (m) { define('Wampy', m); } :
	typeof exports === 'object' ? function (m) { module.exports = m(); } :
	function (m) { this.Wampy = m(); }
)(function () {

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
		SUCCESS: { code: 0, description: 'Success!' },
		URI_ERROR: { code: 1, description: 'Topic URI doesn\'t meet requirements!' },
		NO_BROKER: { code: 2, description: 'Server doesn\'t provide broker role!' },
		NO_CALLBACK_SPEC: { code: 3, description: 'No required callback function specified!' },
		INVALID_PARAM: { code: 4, description: 'Invalid parameter(s) specified!' },
		NON_EXIST_SUBSCRIBE_CONFIRM: { code: 5, description: 'Received subscribe confirmation to non existent subscription!' },
		NON_EXIST_SUBSCRIBE_ERROR: { code: 6, description: 'Received error for non existent subscription!' },
		NON_EXIST_UNSUBSCRIBE: { code: 7, description: 'Trying to unsubscribe from non existent subscription!' },
		NON_EXIST_SUBSCRIBE_UNSUBSCRIBED: { code: 8, description: 'Received unsubscribe confirmation to non existent subscription!' },
		NON_EXIST_PUBLISH_ERROR: { code: 9, description: 'Received error for non existent publication!' },
		NON_EXIST_PUBLISH_PUBLISHED: { code: 10, description: 'Received publish confirmation for non existent publication!' },
		NON_EXIST_SUBSCRIBE_EVENT: { code: 11, description: 'Received event for non existent subscription!' },
		NO_DEALER: { code: 12, description: 'Server doesn\'t provide dealer role!' },
		NON_EXIST_CALL_RESULT: { code: 13, description: 'Received rpc result for non existent call!' },
		NON_EXIST_CALL_ERROR: { code: 14, description: 'Received rpc call error for non existent call!' },
		RPC_ALREADY_REGISTERED: { code: 15, description: 'RPC already registered!' },
		NON_EXIST_RPC_REG: { code: 16, description: 'Received rpc registration confirmation for non existent rpc!' },
		NON_EXIST_RPC_UNREG: { code: 17, description: 'Received rpc unregistration confirmation for non existent rpc!' },
		NON_EXIST_RPC_ERROR: { code: 18, description: 'Received error for non existent rpc!' },
		NON_EXIST_RPC_INVOCATION: { code: 19, description: 'Received invocation for non existent rpc!' },
		NON_EXIST_RPC_REQ_ID: { code: 20, description: 'No RPC calls in action with specified request ID!' }
	};

	function getServerUrl(url) {
		var scheme, port, path;

		if (!url) {
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			port = window.location.port !== '' ? ':' + window.location.port : '';
			return scheme + window.location.hostname + port + '/ws';
		} else if (/^ws/.test(url)) {   // ws scheme is specified
			return url;
		} else if (/:\d{1,5}/.test(url)) {  // port is specified
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			return scheme + url;
		} else {    // just path on current server
			scheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
			port = window.location.port !== '' ? ':' + window.location.port : '';
			path = url[0] === '/' ? url : '/' + url;
			return scheme + window.location.hostname + port + path;
		}
	}

	function getWebSocket(url, protocols) {
		var parsedUrl = getServerUrl(url);

		if ('WebSocket' in window) {
		// Chrome, MSIE, newer Firefox
			if (protocols) {
				return new WebSocket(parsedUrl, protocols);
			} else {
				return new WebSocket(parsedUrl);
			}
		} else if ('MozWebSocket' in window) {
			// older versions of Firefox
			if (protocols) {
				return new MozWebSocket(parsedUrl, protocols);
			} else {
				return new MozWebSocket(parsedUrl);
			}
		} else {
			return null;
		}
	}

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
		this.version = 'v1.0.5';

		/**
		 * WS Url
		 * @type {string}
		 * @private
		 */
		this._url = (typeof arguments[0] === 'string') ? url : undefined;

		/**
		 * WS protocols
		 * @type {Array}
		 * @private
		 */
		this._protocols = ['wamp.2.json'];

		/**
		 * WAMP features, supported by Wampy
		 * @type {object}
		 * @private
		 */
		this._wamp_features = {
			agent: 'Wampy.js ' + this.version,
			roles: {
				publisher: {
					features: {
						subscriber_blackwhite_listing: true,
						publisher_exclusion: true,
						publisher_identification: true
					}
				},
				subscriber: {},
				caller: {
					features: {
						callee_blackwhite_listing: true,
						caller_exclusion: true,
						caller_identification: true,
						progressive_call_results: true,
						call_canceling: true
					}
				},
				callee: {
					features: {
						caller_identification: true
					}
				}
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
			server_wamp_features: { roles: {} },

			/**
			 * Are we in state of saying goodbye
			 * @type {boolean}
			 */
			isSayingGoodbye: false,

			/**
			 * Status of last operation
			 */
			opStatus: { code: 0, description: 'Success!', reqId: 0 },

			/**
			 * Timer for reconnection
			 * @type {null}
			 */
			timer: null,

			/**
			 * Reconnection attempts
			 * @type {number}
			 */
			reconnectingAttempts: 0
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
		 * Stored Pub/Sub topics
		 * @type {Array}
		 * @private
		 */
		this._subsTopics = [];

		/**
		 * Stored RPC Registrations
		 * @type {object}
		 * @private
		 */
		this._rpcRegs = {};

		/**
		 * Stored RPC names
		 * @type {Array}
		 * @private
		 */
		this._rpcNames = [];

		/**
		 * Options hash-table
		 * @type {Object}
		 * @private
		 */
		this._options = {
			/**
			 * Reconnecting flag
			 * @type {boolean}
			 */
			autoReconnect: true,

			/**
			 * Reconnecting interval (in ms)
			 * @type {number}
			 */
			reconnectInterval: 2 * 1000,

			/**
			 * Maximum reconnection retries
			 * @type {number}
			 */
			maxRetries: 25,

			/**
			 * Message serializer
			 * @type {string}
			 */
			transportEncoding: 'json',

			/**
			 * WAMP Realm to join
			 * @type {string}
			 */
			realm: window.location.hostname,

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

		switch (arguments.length) {
			case 1:
				if (typeof arguments[0] !== 'string') {
					this._options = this._merge(this._options, arguments[0]);
				}
				break;
			case 2:
				this._options = this._merge(this._options, options);
				break;
		}

		this._setWsProtocols();
		this._ws = getWebSocket(this._url, this._protocols);
		this._initWsCallbacks();
	};

	/* Internal utils methods */
	/**
	 * Get the new unique request id
	 * @returns {number}
	 * @private
	 */
	Wampy.prototype._getReqId = function () {
		var reqId;

		do {
			/* Lua (and cjson) outputs big numbers in scientific notation :(
			 * Need to find a way of fixing that
			 * For now, i think it's not a big problem to reduce range.
			 */
//			reqId = Math.floor(Math.random() * 9007199254740992);
			reqId = Math.floor(Math.random() * 100000000000000);
		} while (reqId in this._requests);

		return reqId;
	};

	/**
	 * Merge argument objects into one
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

	/**
	 * Check if value is array
	 * @param obj
	 * @returns {boolean}
	 * @private
	 */
	Wampy.prototype._isArray = function (obj) {
		return (!!obj) && (obj.constructor === Array);
	};

	/**
	 * Check if value is object
	 * @param obj
	 * @returns {boolean}
	 * @private
	 */
	Wampy.prototype._isObject = function (obj) {
		return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]';
	};

	/**
	 * Check if value is object literal
	 * @param obj
	 * @returns {boolean}
	 * @private
	 */
	Wampy.prototype._isPlainObject = function (obj) {
		return (!!obj) && (obj.constructor === Object);
	};

	/**
	 * Fix websocket protocols based on options
	 * @private
	 */
	Wampy.prototype._setWsProtocols = function () {

		if (window.msgpack !== undefined) {
			if (this._options.transportEncoding === 'msgpack') {
				this._protocols = ['wamp.2.msgpack', 'wamp.2.json'];
			} else {
				this._protocols = ['wamp.2.json', 'wamp.2.msgpack'];
			}
		}

	};

	/**
	 * Validate uri
	 * @param {string} uri
	 * @returns {boolean}
	 * @private
	 */
	Wampy.prototype._validateURI = function (uri) {
		var re = /^([0-9a-z_]{2,}\.)*([0-9a-z_]{2,})$/;
		if (!re.test(uri) || uri.indexOf('wamp') === 0) {
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
		var bytearray;

		if (this._options.transportEncoding === 'msgpack') {
			try {
				bytearray = new Uint8Array(msgpack.encode(msg));

				return bytearray.buffer;

			} catch (e) {
				throw new Error('[wampy] no msgpack encoder available!');
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
		if (this._options.transportEncoding === 'msgpack') {
			try {

				return msgpack.decode(msg);

			} catch (e) {
				throw new Error('[wampy] no msgpack encoder available!');
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
		if (msg) {
			this._wsQueue.push(this._encode(msg));
		}

		if (this._ws && this._ws.readyState === 1 && this._cache.sessionId) {
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
		this._subsTopics = [];
		this._requests = {};
		this._calls = {};
		this._rpcRegs = {};
		this._rpcNames = [];

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
		var p;

		console.log('[wampy] websocket connected');

		p = this._ws.protocol.split('.');
		this._options.transportEncoding = p[2];

		if (this._options.transportEncoding === 'msgpack') {
			this._ws.binaryType = 'arraybuffer';
		}

		// WAMP SPEC: [HELLO, Realm|uri, Details|dict]
		// Sending directly 'cause it's a hello msg and no sessionId check is needed
		this._ws.send(this._encode([WAMP_MSG_SPEC.HELLO, this._options.realm, this._wamp_features]));
	};

	Wampy.prototype._wsOnClose = function () {
		var self = this;
		console.log('[wampy] websocket disconnected');

		// Automatic reconnection
		if ((this._cache.sessionId || this._cache.reconnectingAttempts) &&
			this._options.autoReconnect && this._cache.reconnectingAttempts < this._options.maxRetries &&
			!this._cache.isSayingGoodbye) {
			this._cache.sessionId = null;
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
		var data, id, i, d, result, msg;

		console.log('[wampy] websocket message received', event.data);

		data = this._decode(event.data);

		switch (data[0]) {
			case WAMP_MSG_SPEC.WELCOME:
				// WAMP SPEC: [WELCOME, Session|id, Details|dict]

				if (this._cache.reconnectingAttempts) {
					// There was reconnection
					i = 1;
					this._cache.reconnectingAttempts = 0;
				} else {
					i = 0;
				}

				this._cache.sessionId = data[1];
				this._cache.server_wamp_features = data[2];

				// Firing onConnect event on real connection to WAMP server
				if (this._options.onConnect) {
					this._options.onConnect();
				}

				if (i === 1) {
					// Let's renew all previous state
					this._renewSubscriptions();
					this._renewRegistrations();
				}

				// Send local queue if there is something out there
				this._send();

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
				if (!this._cache.isSayingGoodbye) {    // get goodbye, initiated by server
					this._cache.isSayingGoodbye = true;
					this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.goodbye_and_out']);
				}
				this._cache.sessionId = null;
				this._ws.close();
				break;
			case WAMP_MSG_SPEC.HEARTBEAT:

				break;
			case WAMP_MSG_SPEC.ERROR:
				// WAMP SPEC: [ERROR, REQUEST.Type|int, REQUEST.Request|id, Details|dict, Error|uri, (Arguments|list, ArgumentsKw|dict)]
				switch (data[1]) {
					case WAMP_MSG_SPEC.SUBSCRIBE:
					case WAMP_MSG_SPEC.UNSUBSCRIBE:
						if (this._requests[data[2]]) {

							if (this._requests[data[2]].callbacks.onError) {
								this._requests[data[2]].callbacks['onError'](data[4]);
							}

							delete this._requests[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_ERROR;
						}
						break;
					case WAMP_MSG_SPEC.PUBLISH:
						if (this._requests[data[2]]) {

							if (this._requests[data[2]].callbacks.onError) {
								this._requests[data[2]].callbacks['onError'](data[4]);
							}

							delete this._requests[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_PUBLISH_ERROR;
						}
						break;
					case WAMP_MSG_SPEC.REGISTER:
					case WAMP_MSG_SPEC.UNREGISTER:
						// WAMP SPEC: [ERROR, REGISTER, REGISTER.Request|id, Details|dict, Error|uri]
						if (this._requests[data[2]]) {

							if (this._requests[data[2]].callbacks.onError) {
								this._requests[data[2]].callbacks['onError'](data[4]);
							}

							delete this._requests[data[2]];

						} else {
							this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_ERROR;
						}
						break;
					case WAMP_MSG_SPEC.INVOCATION:
						break;
					case WAMP_MSG_SPEC.CALL:
						if (this._calls[data[2]]['onError']) {

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
				if (this._requests[data[1]]) {
					this._subscriptions[this._requests[data[1]].topic] = this._subscriptions[data[2]] = {
						id: data[2],
						callbacks: [this._requests[data[1]].callbacks.onEvent]
					};

					this._subsTopics.push(this._requests[data[1]].topic);

					if (this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_CONFIRM;
				}
				break;
			case WAMP_MSG_SPEC.UNSUBSCRIBED:
				// WAMP SPEC: [UNSUBSCRIBED, UNSUBSCRIBE.Request|id]
				if (this._requests[data[1]]) {
					id = this._subscriptions[this._requests[data[1]].topic].id;
					delete this._subscriptions[this._requests[data[1]].topic];
					delete this._subscriptions[id];

					i = this._subsTopics.indexOf(this._requests[data[1]].topic);
					if (i >= 0) {
						this._subsTopics.splice(i, 1);
					}

					if (this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];
				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_SUBSCRIBE_UNSUBSCRIBED;
				}
				break;
			case WAMP_MSG_SPEC.PUBLISHED:
				// WAMP SPEC: [PUBLISHED, PUBLISH.Request|id, Publication|id]
				if (this._requests[data[1]]) {
					if (this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_PUBLISH_PUBLISHED;
				}
				break;
			case WAMP_MSG_SPEC.EVENT:
				if (this._subscriptions[data[1]]) {

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
				if (this._calls[data[1]]) {

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
					if (!(data[2].progress && data[2].progress === true)) {  // We receive final result (progressive or not)
						delete this._calls[data[1]];
					}

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_CALL_RESULT;
				}
				break;
			case WAMP_MSG_SPEC.REGISTER:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.REGISTERED:
				// WAMP SPEC: [REGISTERED, REGISTER.Request|id, Registration|id]
				if (this._requests[data[1]]) {
					this._rpcRegs[this._requests[data[1]].topic] = this._rpcRegs[data[2]] = {
						id: data[2],
						callbacks: [this._requests[data[1]].callbacks.rpc]
					};

					this._rpcNames.push(this._requests[data[1]].topic);

					if (this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];

				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_REG;
				}
				break;
			case WAMP_MSG_SPEC.UNREGISTER:
				// WAMP SPEC:
				break;
			case WAMP_MSG_SPEC.UNREGISTERED:
				// WAMP SPEC: [UNREGISTERED, UNREGISTER.Request|id]
				if (this._requests[data[1]]) {
					id = this._rpcRegs[this._requests[data[1]].topic].id;
					delete this._rpcRegs[this._requests[data[1]].topic];
					delete this._rpcRegs[id];

					i = this._rpcNames.indexOf(this._requests[data[1]].topic);
					if (i >= 0) {
						this._rpcNames.splice(i, 1);
					}

					if (this._requests[data[1]].callbacks.onSuccess) {
						this._requests[data[1]].callbacks['onSuccess']();
					}

					delete this._requests[data[1]];
				} else {
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_UNREG;
				}
				break;
			case WAMP_MSG_SPEC.INVOCATION:
				if (this._rpcRegs[data[2]]) {

					switch (data.length) {
						case 4:
							// WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict]
							d = null;
							break;
						case 5:
							// WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict, CALL.Arguments|list]
							d = data[4];
							break;
						case 6:
							// WAMP SPEC: [INVOCATION, Request|id, REGISTERED.Registration|id, Details|dict, CALL.Arguments|list, CALL.ArgumentsKw|dict]
							d = data[5];
							break;
					}

					try {
						result = this._rpcRegs[data[2]].callbacks[0](d);
					} catch (e) {
						this._send([WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.invocation_exception']);
						return ;
					}

					// WAMP SPEC: [YIELD, INVOCATION.Request|id, Options|dict, (Arguments|list, ArgumentsKw|dict)]
					if (this._isArray(result)) {
						msg = [WAMP_MSG_SPEC.YIELD, data[1], {}, result];
					} else if (this._isPlainObject(result)) {
						msg = [WAMP_MSG_SPEC.YIELD, data[1], {}, [], result];
					} else if (result === undefined) {
						msg = [WAMP_MSG_SPEC.YIELD, data[1], {}];
					} else {    // single value
						msg = [WAMP_MSG_SPEC.YIELD, data[1], {}, [result]];
					}

					this._send(msg);

				} else {
					// WAMP SPEC: [ERROR, INVOCATION, INVOCATION.Request|id, Details|dict, Error|uri]
					this._send([WAMP_MSG_SPEC.ERROR, WAMP_MSG_SPEC.INVOCATION, data[1], {}, 'wamp.error.no_such_procedure']);
					this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_INVOCATION;
				}

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
		console.log('[wampy] websocket error');

		if (this._options.onError) {
			this._options.onError(error);
		}
	};

	Wampy.prototype._wsReconnect = function () {
		console.log('[wampy] websocket reconnecting...');

		if (this._options.onReconnect) {
			this._options.onReconnect();
		}

		this._cache.reconnectingAttempts++;
		this._ws = getWebSocket(this._url, this._protocols);
		this._initWsCallbacks();
	};

	Wampy.prototype._renewSubscriptions = function () {
		var subs = this._subscriptions,
			st = this._subsTopics,
			s, i;

		this._subscriptions = {};
		this._subsTopics = [];

		s = st.length;
		while (s--) {
			i = subs[st[s]].callbacks.length;
			while (i--) {
				this.subscribe(st[s], subs[st[s]].callbacks[i]);
			}
		}
	};

	Wampy.prototype._renewRegistrations = function () {
		var rpcs = this._rpcRegs,
			rn = this._rpcNames,
			r;

		this._rpcRegs = {};
		this._rpcNames = [];

		r = rn.length;
		while (r--) {
			this.register(rn[r], { rpc: rpcs[rn[r]].callbacks[0] });
		}
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
		} else if (this._isPlainObject(opts)) {
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
	 *      reqId: last send request ID
	 */
	Wampy.prototype.getOpStatus = function () {
		return this._cache.opStatus;
	};

	/**
	 * Get the WAMP Session ID
	 *
	 * @returns Session ID
	 */
	Wampy.prototype.getSessionId = function () {
		return this._cache.sessionId;
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

		this._setWsProtocols(); // in case some one has changed settings
		this._ws = getWebSocket(this._url, this._protocols);
		this._initWsCallbacks();

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
			this._send([WAMP_MSG_SPEC.GOODBYE, {}, 'wamp.error.system_shutdown']);
		} else if (this._ws){
			this._ws.close();
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

		if (!this._cache.sessionId && this._ws.readyState === 1) {
			this._send([WAMP_MSG_SPEC.ABORT, {}, 'wamp.error.abort']);
			this._cache.sessionId = null;
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

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (typeof callbacks === 'function') {
			callbacks = { onEvent: callbacks};
		} else if (this._isPlainObject(callbacks) && callbacks.onEvent !== undefined) {

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._subscriptions[topicURI] || !this._subscriptions[topicURI].callbacks.length) {
			// no such subscription or processing unsubscribing

			reqId = this._getReqId();

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP SPEC: [SUBSCRIBE, Request|id, Options|dict, Topic|uri]
			this._send([WAMP_MSG_SPEC.SUBSCRIBE, reqId, {}, topicURI]);

		} else {    // already have subscription to this topic
			// There is no such callback yet
			if (this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent) < 0) {
				this._subscriptions[topicURI].callbacks.push(callbacks.onEvent);
			}

			if (callbacks.onSuccess) {
				callbacks['onSuccess']();
			}
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		this._cache.opStatus.reqId = reqId;
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
		var reqId, i = -1;

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (this._subscriptions[topicURI]) {

			reqId = this._getReqId();

			if (callbacks === undefined) {
				this._subscriptions[topicURI].callbacks = [];
				callbacks = {};
			} else if (typeof callbacks === 'function') {
				i = this._subscriptions[topicURI].callbacks.indexOf(callbacks);
				callbacks = { onEvent: callbacks };
			} else {
				i = this._subscriptions[topicURI].callbacks.indexOf(callbacks.onEvent);
			}

			if (i >= 0) {
				this._subscriptions[topicURI].callbacks.splice(i, 1);
			}

			if (this._subscriptions[topicURI].callbacks.length) {
				// There are another callbacks for this topic
				this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
				return this;
			}

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP_SPEC: [UNSUBSCRIBE, Request|id, SUBSCRIBED.Subscription|id]
			this._send([WAMP_MSG_SPEC.UNSUBSCRIBE, reqId, this._subscriptions[topicURI].id]);

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_UNSUBSCRIBE;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		this._cache.opStatus.reqId = reqId;
		return this;
	};

	/**
	 * Publish a event to topic
	 * @param {string} topicURI
	 * @param {string|number|Array|object} payload - optional parameter.
	 * @param {object} callbacks - optional hash table of callbacks:
	 *                          { onSuccess: will be called when publishing would be confirmed
	 *                            onError: will be called if publishing would be aborted }
	 * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
	 *                          { exclude: integer|array WAMP session id(s) that won't receive a published event,
	 *                                     even though they may be subscribed
	 *                            eligible: integer|array WAMP session id(s) that are allowed to receive a published event
	 *                            exclude_me: bool flag of receiving publishing event by initiator
	 *                            disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID)
	 *                                   to receivers of a published event }
	 * @returns {Wampy}
	 */
	Wampy.prototype.publish = function (topicURI, payload, callbacks, advancedOptions) {
		var reqId, msg, options = {}, err = false;

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.broker) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_BROKER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (this._isPlainObject(callbacks)) {
			options.acknowledge = true;
		}

		if (advancedOptions !== undefined) {

			if (this._isPlainObject(advancedOptions)) {
				if (advancedOptions.exclude){
					if (this._isArray(advancedOptions.exclude)) {
						options.exclude = advancedOptions.exclude;
					} else if (typeof advancedOptions.exclude === 'number') {
						options.exclude = [advancedOptions.exclude];
					} else {
						err = true;
					}
				}

				if (advancedOptions.eligible){
					if (this._isArray(advancedOptions.eligible)) {
						options.eligible = advancedOptions.eligible;
					} else if (typeof advancedOptions.eligible === 'number') {
						options.eligible = [advancedOptions.eligible];
					} else {
						err = true;
					}
				}

				if (advancedOptions.hasOwnProperty('exclude_me')) {
					options.exclude_me = advancedOptions.exclude_me !== false;
				}

				if (advancedOptions.hasOwnProperty('disclose_me')) {
					options.disclose_me = advancedOptions.disclose_me === true;
				}

			} else {
				err = true;
			}

			if (err) {
				this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;

				if (this._isPlainObject(callbacks) && callbacks.onError) {
					callbacks['onError'](this._cache.opStatus.description);
				}

				return this;
			}
		}

		reqId = this._getReqId();

		switch (arguments.length) {
			case 1:
				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri]
				msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI];
				break;
			case 2:
				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
				if (this._isArray(payload)) {
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, payload];
				} else if (this._isPlainObject(payload)) {
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [], payload];
				} else {    // assume it's a single value
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [payload]];
				}
				break;
			default:
				this._requests[reqId] = {
							topic: topicURI,
							callbacks: callbacks
						};

				// WAMP_SPEC: [PUBLISH, Request|id, Options|dict, Topic|uri, Arguments|list (, ArgumentsKw|dict)]
				if (this._isArray(payload)) {
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, payload];
				} else if (this._isPlainObject(payload)) {
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [], payload];
				} else {    // assume it's a single value
					msg = [WAMP_MSG_SPEC.PUBLISH, reqId, options, topicURI, [payload]];
				}
				break;
		}

		this._send(msg);
		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		this._cache.opStatus.reqId = reqId;
		return this;
	};

	/**
	 * Remote Procedure Call
	 * @param {string} topicURI
	 * @param {string|number|Array|object} payload - can be either a value of any type or null
	 * @param {function|object} callbacks - if it is a function - it will be treated as result callback function
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called with result on successful call
	 *                            onError: will be called if invocation would be aborted }
	 * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
	 *                          { exclude: integer|array WAMP session id(s) providing an explicit list of (potential)
	 *                                  Callees that a call won't be forwarded to, even though they might be registered
	 *                            eligible: integer|array WAMP session id(s) providing an explicit list of (potential)
	 *                                  Callees that are (potentially) forwarded the call issued
	 *                            exclude_me: bool flag of potentially forwarding call to caller if he is registered as callee
	 *                            disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
	 *                                   to endpoints of a routed call
	 *                            receive_progress: bool flag for receiving progressive results. In this case onSuccess function
	 *                                   will be called every time on receiving result }
	 * @returns {Wampy}
	 */
	Wampy.prototype.call = function (topicURI, payload, callbacks, advancedOptions) {
		var reqId, msg, options = {}, err = false;

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (typeof callbacks === 'function') {
			callbacks = { onSuccess: callbacks};
		} else if (this._isPlainObject(callbacks) && callbacks.onSuccess !== undefined) {

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (advancedOptions !== undefined) {

			if (this._isPlainObject(advancedOptions)) {
				if (advancedOptions.exclude){
					if (this._isArray(advancedOptions.exclude)) {
						options.exclude = advancedOptions.exclude;
					} else if (typeof advancedOptions.exclude === 'number') {
						options.exclude = [advancedOptions.exclude];
					} else {
						err = true;
					}
				}

				if (advancedOptions.eligible){
					if (this._isArray(advancedOptions.eligible)) {
						options.eligible = advancedOptions.eligible;
					} else if (typeof advancedOptions.eligible === 'number') {
						options.eligible = [advancedOptions.eligible];
					} else {
						err = true;
					}
				}

				if (advancedOptions.hasOwnProperty('exclude_me')) {
					options.exclude_me = advancedOptions.exclude_me !== false;
				}

				if (advancedOptions.hasOwnProperty('disclose_me')) {
					options.disclose_me = advancedOptions.disclose_me === true;
				}

				if (advancedOptions.hasOwnProperty('receive_progress')) {
					options.receive_progress = advancedOptions.receive_progress === true;
				}

			} else {
				err = true;
			}

			if (err) {
				this._cache.opStatus = WAMP_ERROR_MSG.INVALID_PARAM;

				if (this._isPlainObject(callbacks) && callbacks.onError) {
					callbacks['onError'](this._cache.opStatus.description);
				}

				return this;
			}
		}

		do {
			reqId = this._getReqId();
		} while (reqId in this._calls);

		this._calls[reqId] = callbacks;

		// WAMP SPEC: [CALL, Request|id, Options|dict, Procedure|uri, (Arguments|list, ArgumentsKw|dict)]
		if (payload === null) {
			msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI];
		} else {
			if (this._isArray(payload)) {
				msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, payload];
			} else if (this._isPlainObject(payload)) {
				msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, [], payload];
			} else {    // assume it's a single value
				msg = [WAMP_MSG_SPEC.CALL, reqId, options, topicURI, [payload]];
			}
		}

		this._send(msg);
		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		this._cache.opStatus.reqId = reqId;
		return this;
	};

	/**
	 * RPC invocation cancelling
	 *
	 * @param {int} reqId RPC call request ID
	 * @param {function|object} callbacks - if it is a function - it will be called if successfully sent canceling message
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called if successfully sent canceling message
	 *                            onError: will be called if some error occurred }
	 * @param {object} advancedOptions - optional parameter. Must include any or all of the options:
	 *                          { mode: string|one of the possible modes:
	 *                                  "skip" | "kill" | "killnowait". Skip is default.
	  *                          }
	 *
	 * @returns {Wampy}
	 */
	Wampy.prototype.cancel = function (reqId, callbacks, advancedOptions) {
		var options = { mode: 'skip' };

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!reqId || !this._calls[reqId]) {
			this._cache.opStatus = WAMP_ERROR_MSG.NON_EXIST_RPC_REQ_ID;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (advancedOptions !== undefined) {
			if (this._isPlainObject(advancedOptions)) {
				if (advancedOptions.hasOwnProperty('mode')) {
					options.mode = /skip|kill|killnowait/.test(advancedOptions.mode) ? advancedOptions.mode : 'skip' ;
				}
			}
		}

		// WAMP SPEC: [CANCEL, CALL.Request|id, Options|dict]
		this._send([WAMP_MSG_SPEC.CANCEL, reqId, options]);

		if (callbacks.onSuccess) {
			callbacks['onSuccess']();
		}

		this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
		this._cache.opStatus.reqId = reqId;
		return this;

	};

	/**
	 * RPC registration for invocation
	 * @param {string} topicURI
	 * @param {function|object} callbacks - if it is a function - it will be treated as rpc itself
	 *                          or it can be hash table of callbacks:
	 *                          { rpc: registered procedure
	 *                            onSuccess: will be called on successful registration
	 *                            onError: will be called if registration would be aborted }
	 * @returns {Wampy}
	 */
	Wampy.prototype.register = function (topicURI, callbacks) {
		var reqId;

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (typeof callbacks === 'function') {
			callbacks = { rpc: callbacks};
		} else if (this._isPlainObject(callbacks) && callbacks.rpc !== undefined) {

		} else {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_CALLBACK_SPEC;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._rpcRegs[topicURI] || !this._rpcRegs[topicURI].callbacks.length) {
			// no such registration or processing unregistering

			reqId = this._getReqId();

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP SPEC: [REGISTER, Request|id, Options|dict, Procedure|uri]
			this._send([WAMP_MSG_SPEC.REGISTER, reqId, {}, topicURI]);
			this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
			this._cache.opStatus.reqId = reqId;
		} else {    // already have registration with such topicURI
			this._cache.opStatus = WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

		}

		return this;

	};

	/**
	 * RPC unregistration for invocation
	 * @param {string} topicURI
	 * @param {function|object} callbacks - if it is a function, it will be called on successful unregistration
	 *                          or it can be hash table of callbacks:
	 *                          { onSuccess: will be called on successful unregistration
	 *                            onError: will be called if unregistration would be aborted }
	 * @returns {Wampy}
	 */
	Wampy.prototype.unregister = function (topicURI, callbacks) {
		var reqId;

		if (this._cache.sessionId && !this._cache.server_wamp_features.roles.dealer) {
			this._cache.opStatus = WAMP_ERROR_MSG.NO_DEALER;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (!this._validateURI(topicURI)) {
			this._cache.opStatus = WAMP_ERROR_MSG.URI_ERROR;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

			return this;
		}

		if (typeof callbacks === 'function') {
			callbacks = { onSuccess: callbacks};
		}

		if (this._rpcRegs[topicURI]) {   // there is such registration

			reqId = this._getReqId();

			this._requests[reqId] = {
				topic: topicURI,
				callbacks: callbacks
			};

			// WAMP SPEC: [UNREGISTER, Request|id, REGISTERED.Registration|id]
			this._send([WAMP_MSG_SPEC.UNREGISTER, reqId, this._rpcRegs[topicURI].id]);
			this._cache.opStatus = WAMP_ERROR_MSG.SUCCESS;
			this._cache.opStatus.reqId = reqId;
		} else {    // already have registration with such topicURI
			this._cache.opStatus = WAMP_ERROR_MSG.RPC_ALREADY_REGISTERED;

			if (this._isPlainObject(callbacks) && callbacks.onError) {
				callbacks['onError'](this._cache.opStatus.description);
			}

		}

		return this;

	};

	return Wampy;

});
