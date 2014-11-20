wampy.js
========

Simple WAMP (WebSocket Application Messaging Protocol) Javascript client-side implementation

Table of Contents
=================

* [Description](#description)
* [Usage example](#usage-example)
* [Quick comparison to other libs](#quick-comparison-to-other-libs)
* [Installation](#installation)
* [Methods](#methods)
	* [Constructor](#constructorurl-options)
	* [options](#optionsopts)
	* [getOpStatus](#getopstatus)
	* [getSessionId](#getsessionid)
	* [connect](#connecturl)
	* [disconnect](#disconnect)
	* [abort](#abort)
	* [subscribe](#subscribetopicuri-callbacks)
	* [unsubscribe](#unsubscribetopicuri-callbacks)
	* [publish](#publishtopicuri-payload-callbacks-advancedoptions)
	* [call](#calltopicuri-payload-callbacks-advancedoptions)
	* [register](#registertopicuri-callbacks)
	* [unregister](#unregistertopicuri-callbacks)
* [Copyright and License](#copyright-and-license)
* [See Also](#see-also)

Description
===========

Wampy.js is client-side javascript library. It implements [WAMP](http://wamp.ws) v2 specification on top of
WebSocket object, also provides additional features like autoreconnecting and use of Chaining Pattern.
It has no external dependencies (by default) and is easy to use. Also it's compatible with AMD and browserify.

Wampy.js supports next WAMP roles and features:

* publisher: advanced profile with features:
    * subscriber blackwhite listing
	* publisher exclusion
	* publisher identification
* subscriber: basic profile.
* caller: advanced profile with features:
	* callee blackwhite listing.
	* caller exclusion.
	* caller identification.
* callee: basic profile.

Wampy default serializer is JSON, but it also supports msgpack as serializer, but you need to include msgpack.js as dependency.

For v1 WAMP implementation, please see tag v0.1.0.

[Back to TOC](#table-of-contents)

Usage example
=============

```javascript
var ws = new Wampy('/ws/');
ws.subscribe('system.monitor.update', function (data) { console.log('Received system.monitor.update event!'); })
  .subscribe('client.message', function (data) { console.log('Received client.message event!'); })

ws.call('get.server.time', null, {
	onSuccess: function (stime) {
		console.log('RPC successfully called');
		console.log('Server time is ' + stime);
	},
	onError: function (err) {
		console.log('RPC call failed with error ' + err);
	}
});

// Somewhere else for example
ws.publish('system.monitor.update');

ws.publish('client.message', 'Hi guys!');
```

[Back to TOC](#table-of-contents)

Quick comparison to other libs
==============================

| Topic         | Wampy.js | AutobahnJS  |
|-------------- | -------- | ----------- |
| Runs on | browser | browser and NodeJS |
| Dependencies | msgpack.js (optional), jDataView (optional) | when.js, CryptoJS (optional) |
| Creating connection | var connection = new Wampy('ws://127.0.0.1:9000/', { realm: 'realm1' }); | var connection = new autobahn.Connection({url: 'ws://127.0.0.1:9000/', realm: 'realm1'}); |
| Opening a connection | connection opens on creating an instance, or can be opened by: connection.connect() | connection.open(); |
| Connection Callbacks | Wampy supports next callbacks: onConnect, onClose, onError, onReconnect. Callbacks can be specified via options object passed to constructor, or via .options() method. | AutobahnJS provides two callbacks: connection.onopen = function (session) { } and connection.onclose = function (reason/string, details/dict) { } |
| WAMP API methods with parameters | While using Wampy you don't have to explicitly specify the payload type (single value, array, object), just pass it to api method. <br/>For example:<br/>ws.publish('chat.message.received', 'user message');<br/>ws.publish('chat.message.received', ['user message1', 'user message2']);<br/>ws.publish('chat.message.received', { message: 'user message'});<br/>Also Wampy is clever enough to understand some specific options, for example, if you specify a success or error callback to publish method, Wampy will automatically set acknowledge flag to true.  | In AutobahnJS you need to use only arrays and objects, as it's specified in WAMP, and also choose right argument position.<br/>For example:<br/>session.publish('com.myapp.hello', ['Hello, world!']);<br/>session.publish('com.myapp.hello', [], {message: 'Hello, world!'});<br/>Also you need to explicitly provide additional options, like {acknowledge: true} |
| Method callbacks | Most of the API methods take a **callbacks** parameter, which is hash-table of posible callbacks | AutobahnJS make use of **Deffered** object, and most of API methods return a deferred object, so you can specify callbacks using .then() method |
| Chaining support | Wampy supports methods chaining.<br/>connection.subscribe(...).publish(...).call(...) |  |

Which one library to use - choice is yours!

[Back to TOC](#table-of-contents)

Installation
============

Wampy.js can be installed using bower or npm or just by file-copy :)

```bash
> bower install wampy.js
# Or
> npm install wampy
```

To use Wampy simply add wampy-all.min.js file to your page. It contains all the necessary
libs: jdataview - for handling UInt64 data and msgpack encoder.

```html
<script src="wampy-all.min.js"></script>
```

In case, you don't plan to use msgpack, just include clean wampy.min.js.

```html
<script src="wampy.min.js"></script>
```

[Back to TOC](#table-of-contents)

Methods
========

Constructor([url[, options]])
------------------------------------------

Wampy constructor can take 2 parameters:

* **url** to wamp server - optional. If its undefined, page-schema://page-server:page-port/ws will be used.
Can be in forms of:
	* fully qualified url: schema://server:port/path
	* server:port/path. In this case page schema will be used.
	* /path. In this case page schema, server, port will be used.
* **options** hash-table - optional. See description.

```javascript
ws = new Wampy();
ws = new Wampy('/my-socket-path');
ws = new Wampy('ws://socket.server.com:5000/ws', { autoReconnect: false });
ws = new Wampy({ reconnectInterval: 1*1000 });
```

[Back to TOC](#table-of-contents)

options([opts])
---------------

.options() method can be called in two forms:

* without parameters it will return current options
* with one parameter as hash-table it will set new options. Support chaining.

Options attributes description:

* **autoReconnect**. Default value: true. Enable autoreconnecting. In case of connection failure, Wampy will try to reconnect to WAMP server, and if you were subscribed to any topics,
or had registered some procedures, Wampy will resubscribe to that topics and reregister procedures.
* **reconnectInterval**. Default value: 2000 (ms). Reconnection Interval in ms.
* **maxRetries**. Default value: 25. Max reconnection attempts. After reaching this value [.disconnect()](#disconnect)
will be called
* **transportEncoding**. Default value: json. Transport serializer to use. Supported 2 values: json|msgpack.
For using msgpack you need to include msgpack javascript library, and also wamp server, that also supports it.
* **realm**. Default value: window.location.hostname. WAMP Realm to join on server. See WAMP spec for additional info.
* **onConnect**. Default value: undefined. Callback function. Fired when connection to wamp server is established.
* **onClose**. Default value: undefined. Callback function. Fired on closing connection to wamp server.
* **onError**. Default value: undefined. Callback function. Fired on error in websocket communication.
* **onReconnect**. Default value: undefined. Callback function. Fired every time on reconnection attempt.

```javascript
ws.options();

ws.options({
	reconnectInterval: 1000,
	maxRetries: 999,
	onConnect: function () { console.log('Yahoo! We are online!'); },
	onClose: function () { console.log('See you next time!'); },
	onError: function () { console.log('Breakdown happened'); },
	onReconnect: function () { console.log('Reconnecting...'); }
});
```

[Back to TOC](#table-of-contents)

getOpStatus()
---------------

Returns the status of last operation. Wampy is developed in a such way, that every operation returns **this** even
in case of error to suport chaining. But if you want to know status of last operation, you can call .getOpStatus().
This method returns an object with 2 attributes: code and description. Code is integer, and value > 0 means error.
Description is a description of code.

```javascript
ws.publish('system.monitor.update');
ws.getOpStatus();
// may return { code: 1, description: "Topic URI doesn't meet requirements!" }
// or { code: 2, description: "Server doesn't provide broker role!" }
```

[Back to TOC](#table-of-contents)

getSessionId()
---------------

Returns the WAMP Session ID.

```javascript
ws.getSessionId();
```

[Back to TOC](#table-of-contents)

connect([url])
---------------------------

Connects to wamp server. **url** parameter is the same as specified in [Constructor](#constructor).
Supports chaining.

```javascript
ws.connect();
ws.connect('/my-socket-path');
ws.connect('wss://socket.server.com:5000/ws');
```

[Back to TOC](#table-of-contents)

disconnect()
------------

Disconnects from wamp server. Clears all queues, subscription, calls. Supports chaining.

```javascript
ws.disconnect();
```

[Back to TOC](#table-of-contents)

abort()
------------

Aborts WAMP session and closes a websocket connection. If it is called on handshake stage - it sends a abort message
to wamp server (as described in spec).
Also clears all queues, subscription, calls. Supports chaining.

```javascript
ws.abort();
```

[Back to TOC](#table-of-contents)

subscribe(topicURI, callbacks)
-----------------------------

Subscribes for topicURI events. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **callbacks**. If it is a function - it will be treated as published event callback
             or it can be hash table of callbacks:

           { onSuccess: will be called when subscribe would be confirmed
             onError: will be called if subscribe would be aborted
             onEvent: will be called on receiving published event }

```javascript
ws.subscribe('chat.message.received', function (msg) { console.log('Received new chat message!'); });

ws.subscribe('some.another.topic', {
   onSuccess: function () { console.log('Successfully subscribed to topic'); },
   onError: function (err) { console.log('Subscription error:' + err); },
   onEvent: function (data) { console.log('Received topic event'); }
});
```

[Back to TOC](#table-of-contents)

unsubscribe(topicURI[, callbacks])
-------------------------------

Unsubscribe from topicURI events. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **callbacks**. If it is a function - it will be treated as published event callback to remove
             or it can be hash table of callbacks:

           { onSuccess: will be called when unsubscribe would be confirmed
             onError: will be called if unsubscribe would be aborted
             onEvent: published event callback to remove }
or it can be not specified, in this case all callbacks and subscription will be removed.

```javascript
var f1 = function (data) { ... };
ws.unsubscribe('subscribed.topic', f1);

ws.unsubscribe('chat.message.received');
```

[Back to TOC](#table-of-contents)

publish(topicURI[, payload[, callbacks[, advancedOptions]]])
-----------------------------------------------

Publish a new event to topic. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **payload**. Publishing event data. Optional. May be any single value or array or hash-table object or null.
* **callbacks**. Optional hash table of callbacks:

           { onSuccess: will be called when publishing would be confirmed
             onError: will be called if publishing would be aborted }
* **advancedOptions**. Optional parameter. Must include any or all of the options:

           { exclude:    integer|array WAMP session id(s) that won't receive a published event, even though they may be subscribed
             eligible:   integer|array WAMP session id(s) that are allowed to receive a published event
             exclude_me: bool flag of receiving publishing event by initiator (if it is subscribed to this topic)
             disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID) to receivers of a published event }

```javascript
ws.publish('user.logged.in');
ws.publish('chat.message.received', 'user message');
ws.publish('chat.message.received', ['user message1', 'user message2']);
ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 });
ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 }, {
  onSuccess: function () { console.log('User successfully modified'); }
});
ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 }, {
  onSuccess: function () { console.log('User successfully modified'); },
  onError: function (err) { console.log('User modification failed', err); }
});
ws.publish('chat.message.received', ['Private message'], null, { eligible: 123456789 });
```

[Back to TOC](#table-of-contents)

call(topicURI[, payload[, callbacks[, advancedOptions]]])
-----------------------------------------------

Make a RPC call to topicURI. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **payload**. RPC data. Optional. May be any single value or array or hash-table object or null.
* **callbacks**. If it is a function - it will be treated as result callback function
             or it can be hash table of callbacks:

           { onSuccess: will be called with result on successful call
             onError: will be called if invocation would be aborted }
* **advancedOptions**. Optional parameter. Must include any or all of the options:

           { exclude: integer|array WAMP session id(s) providing an explicit list of (potential)
                      Callees that a call won't be forwarded to, even though they might be registered
             eligible: integer|array WAMP session id(s) providing an explicit list of (potential)
                       Callees that are (potentially) forwarded the call issued
             exclude_me: bool flag of potentially forwarding call to caller if he is registered as callee
             disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
                           to endpoints of a routed call }

```javascript
ws.call('server.time', null, function (data) { console.log('Server time is ' + d[0]); });

ws.call('start.migration', null, {
	onSuccess: function (data) {
		console.log('RPC successfully called');
	},
	onError: function (err) {
		console.log('RPC call failed!',err);
	}
});

ws.call('restore.backup', { backupFile: 'backup.zip' }, {
	onSuccess: function (data) {
		console.log('Backup successfully restored');
	},
	onError: function (err) {
		console.log('Restore failed!',err);
	}
});
```

[Back to TOC](#table-of-contents)

register(topicURI, callbacks)
-----------------------------------------------

RPC registration for invocation.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **callbacks**. Required. If it is a function - it will be treated as rpc itself
             or it can be hash table of callbacks:

           { rpc: registered procedure
             onSuccess: will be called on successful registration
             onError: will be called if registration would be aborted }

```javascript
var sqrt_f = function (x) { return x*x; };


ws.register('sqrt.value', sqrt_f);

ws.register('sqrt.value', {
	rpc: sqrt_f,
	onSuccess: function (data) {
		console.log('RPC successfully registered');
	},
	onError: function (err) {
		console.log('RPC registration failed!',err);
	}
});
```

[Back to TOC](#table-of-contents)

unregister(topicURI, callbacks)
-----------------------------------------------

RPC unregistration from invocations

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **callbacks**. Optional. If it is a function - it will be called on successful unregistration
             or it can be hash table of callbacks:

           { onSuccess: will be called on successful unregistration
             onError: will be called if unregistration would be aborted }

```javascript
ws.unregister('sqrt.value');

ws.unregister('sqrt.value', {
	onSuccess: function (data) {
		console.log('RPC successfully unregistered');
	},
	onError: function (err) {
		console.log('RPC unregistration failed!',err);
	}
});
```

[Back to TOC](#table-of-contents)

Copyright and License
=====================

Wampy.js library is licensed under the MIT License (MIT).

Copyright (c) 2014 Konstantin Burkalev

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[Back to TOC](#table-of-contents)

See Also
========

* [WAMP specification](http://wamp.ws)
* [Wiola](http://ksdaemon.github.io/wiola/) - WAMP in Lua on top of nginx/openresty

[Back to TOC](#table-of-contents)
