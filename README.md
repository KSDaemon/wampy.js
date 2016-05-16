wampy.js
========

Simple WAMP (WebSocket Application Messaging Protocol) Javascript client-side implementation

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Code coverage][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![DevDependency Status][depstat-dev-image]][depstat-dev-url]
[![MIT License][license-image]][license-url]

[![Gitter Chat][gitter-image]][gitter-url]

Table of Contents
=================

* [Description](#description)
* [Usage example](#usage-example)
* [Quick comparison to other libs](#quick-comparison-to-other-libs)
* [Installation](#installation)
* [Updating versions](#updating-versions)
* [API](#api)
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
	* [cancel](#cancelreqId-callbacks-advancedOptions)
	* [register](#registertopicuri-callbacks)
	* [unregister](#unregistertopicuri-callbacks)
* [Tests and code coverage](#tests-and-code-coverage)
* [Copyright and License](#copyright-and-license)
* [See Also](#see-also)

Description
===========

Wampy.js is javascript library, that runs both in browser and node.js enviroments. It implements [WAMP][] v2 specification on top of
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
	* progressive call results.
* callee: basic profile.

Wampy default serializer is JSON, but it also supports msgpack as serializer.
In that case you need to include msgpack5.js as dependency. See [msgpack5][] for more info.

For WAMP v1 implementation, please see tag v0.1.0.

[Back to TOC](#table-of-contents)

Usage example
=============

```javascript
var ws = new Wampy('/ws/', { realm: 'AppRealm' });
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
| Dependencies | msgpack5.js (optional) | when.js, CryptoJS (optional) |
| Creating connection | var connection = new Wampy('ws://127.0.0.1:9000/', { realm: 'realm1' }); | var connection = new autobahn.Connection({url: 'ws://127.0.0.1:9000/', realm: 'realm1'}); |
| Opening a connection | connection opens on creating an instance, or can be opened by: connection.connect() | connection.open(); |
| Connection Callbacks | Wampy supports next callbacks: onConnect, onClose, onError, onReconnect. Callbacks can be specified via options object passed to constructor, or via .options() method. | AutobahnJS provides two callbacks: connection.onopen = function (session) { } and connection.onclose = function (reason/string, details/dict) { } |
| WAMP API methods with parameters | While using Wampy you don't have to explicitly specify the payload type (single value, array, object), just pass it to api method. <br/>For example:<br/>ws.publish('chat.message.received', 'user message');<br/>ws.publish('chat.message.received', ['user message1', 'user message2']);<br/>ws.publish('chat.message.received', { message: 'user message'});<br/>Also Wampy is clever enough to understand some specific options, for example, if you specify a success or error callback to publish method, Wampy will automatically set acknowledge flag to true.  | In AutobahnJS you need to use only arrays and objects, as it's specified in WAMP, and also choose right argument position.<br/>For example:<br/>session.publish('com.myapp.hello', ['Hello, world!']);<br/>session.publish('com.myapp.hello', [], {message: 'Hello, world!'});<br/>Also you need to explicitly provide additional options, like {acknowledge: true} |
| Method callbacks | Most of the API methods take a **callbacks** parameter, which is hash-table of posible callbacks | AutobahnJS make use of **Deffered** object, and most of API methods return a deferred object, so you can specify callbacks using .then() method |
| Chaining support | Wampy supports methods chaining.<br/>connection.subscribe(...).publish(...).call(...) |  |
| Transport encoders | json, msgpack (optional) | json |

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

To use Wampy simply add wampy-all.min.js file to your page. It contains msgpack encoder plus wampy itself.

```html
<script src="wampy-all.min.js"></script>
```

In case, you don't plan to use msgpack, just include clean wampy.min.js.

```html
<script src="wampy.min.js"></script>
```

[Back to TOC](#table-of-contents)

Updating versions
=================

Please refer to [Migrating.md](Migrating.md) for instructions on upgrading major versions.

API
===

Below is a description of exposed public API. Btw, wampy has a type definitions, available at [DefinitelyTyped.org][].

Constructor([url[, options]])
------------------------------------------

Wampy constructor can take 2 parameters:

* **url** to wamp server - optional. If its undefined, page-schema://page-server:page-port/ws will be used.
Can be in forms of:
	* fully qualified url: schema://server:port/path
	* server:port/path. In this case page schema will be used.
	* /path. In this case page schema, server, port will be used.
* **options** hash-table. The only required field is `realm`. For node.js enviroment also necessary to
specify `ws` - websocket module. See description below.

```javascript
// in browser
ws = new Wampy();
ws = new Wampy('/my-socket-path');
ws = new Wampy('ws://socket.server.com:5000/ws', { autoReconnect: false });
ws = new Wampy({ reconnectInterval: 1*1000 });

// in node.js
w3cws = require('websocket').w3cwebsocket;
ws = new Wampy(null, { ws: w3cws });
ws = new Wampy('/my-socket-path', { ws: w3cws });
ws = new Wampy('ws://socket.server.com:5000/ws', { autoReconnect: false, ws: w3cws });
ws = new Wampy({ reconnectInterval: 1*1000, ws: w3cws });

```

Json serializer will be used by default. If you want to use msgpack encoder, pass it through options,
and set encoding type to 'msgpack'.

```javascript
// in browser
ws = new Wampy('ws://socket.server.com:5000/ws', {
    transportEncoding: 'msgpack',
    msgpackCoder: msgpack5
});
ws = new Wampy({
    transportEncoding: 'msgpack',
    msgpackCoder: msgpack5
});

// in node.js
w3cws = require('websocket').w3cwebsocket;
msgpack = require('msgpack5')();
ws = new Wampy('ws://socket.server.com:5000/ws', {
    ws: w3cws,
    transportEncoding: 'msgpack',
    msgpackCoder: msgpack
});
ws = new Wampy({
    ws: w3cws,
    transportEncoding: 'msgpack',
    msgpackCoder: msgpack
});

```


[Back to TOC](#table-of-contents)

options([opts])
---------------

.options() method can be called in two forms:

* without parameters it will return current options
* with one parameter as hash-table it will set new options. Support chaining.

Options attributes description:

* **autoReconnect**. Default value: true. Enable autoreconnecting. In case of connection failure, Wampy will
try to reconnect to WAMP server, and if you were subscribed to any topics,
or had registered some procedures, Wampy will resubscribe to that topics and reregister procedures.
* **reconnectInterval**. Default value: 2000 (ms). Reconnection Interval in ms.
* **maxRetries**. Default value: 25. Max reconnection attempts. After reaching this value [.disconnect()](#disconnect)
will be called
* **transportEncoding**. Default value: json. Transport serializer to use. Supports 2 values: json|msgpack.
For using msgpack you need to provide [msgpack5][] javascript library, set up **msgpackCoder** option, and wamp server,
that also supports it.
* **realm**. Default value: null. WAMP Realm to join on server. See WAMP spec for additional info.
* **helloCustomDetails**. Default value: null. Custom attributes to send to router on hello.
* **onChallenge**. Default value: null. Callback function. Fired when wamp server requests authentication during session establishment.
* **authid**. Default value: null. Authentication (user) id to use in challenge.
* **onConnect**. Default value: null. Callback function. Fired when connection to wamp server is established.
* **onClose**. Default value: null. Callback function. Fired on closing connection to wamp server.
* **onError**. Default value: null. Callback function. Fired on error in websocket communication.
* **onReconnect**. Default value: null. Callback function. Fired every time on reconnection attempt.
* **onReconnectSuccess**. Default value: null. Callback function. Fired every time when reconnection succeeded.
* **ws**. Default value: null. User provided WebSocket class. Useful in node enviroment.
* **msgpackCoder**. Default value: null. User provided msgpack class. Useful if you plan to use msgpack encoder
instead of default json. Teoretically, any msgpack encoder with encode/decode methods should work.
In practice, [msgpack5][] tested and works well with [Wiola][], [msgpack-lite](https://github.com/kawanet/msgpack-lite)
doesn't work as expected. Feel free to research other variants.

```javascript
ws.options();

ws.options({
	reconnectInterval: 1000,
	maxRetries: 999,
	onConnect: function () { console.log('Yahoo! We are online!'); },
	onClose: function () { console.log('See you next time!'); },
	onError: function () { console.log('Breakdown happened'); },
	onReconnect: function () { console.log('Reconnecting...'); },
	onReconnectSuccess: function () { console.log('Reconnection succeeded...'); }
});
```

[Back to TOC](#table-of-contents)

getOpStatus()
---------------

Returns the status of last operation. Wampy is developed in a such way, that every operation returns **this** even
in case of error to suport chaining. But if you want to know status of last operation, you can call .getOpStatus().
This method returns an object with 2 or 3 attributes: code and description and possible request ID .
Code is integer, and value > 0 means error.
Description is a description of code.
Request ID is integer and may be useful in some cases (call canceling for example).

```javascript
ws.publish('system.monitor.update');
ws.getOpStatus();
// may return { code: 1, description: "Topic URI doesn't meet requirements!" }
// or { code: 2, description: "Server doesn't provide broker role!" }
// or { code: 0, description: "Success!", reqId: 1565723572 }
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

Aborts WAMP session and closes a websocket connection.  Supports chaining.
If it is called on handshake stage - it sends a abort message to wamp server (as described in spec).
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

           { exclude:    integer|array WAMP session id(s) that won't receive a published event,
                         even though they may be subscribed
             exclude_authid: string|array Authentication id(s) that won't receive
                         a published event, even though they may be subscribed
             exclude_authrole: string|array Authentication role(s) that won't receive
                         a published event, even though they may be subscribed
             eligible: integer|array WAMP session id(s) that are allowed to receive a published event
             eligible_authid: string|array Authentication id(s) that are allowed to receive a published event
             eligible_authrole: string|array Authentication role(s) that are allowed
                         to receive a published event
             exclude_me: bool flag of receiving publishing event by initiator
                         (if it is subscribed to this topic)
             disclose_me: bool flag of disclosure of publisher identity (its WAMP session ID)
                         to receivers of a published event }

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

           { disclose_me: bool flag of disclosure of Caller identity (WAMP session ID)
                        to endpoints of a routed call
             receive_progress: bool flag for receiving progressive results. In this case onSuccess function
                        will be called every time on receiving result
             timeout: integer timeout (in ms) for the call to finish }

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

cancel(reqId, callbacks, advancedOptions)
-----------------------------------------------

RPC invocation cancelling. Supports chaining.

Parameters:

* **reqId**. Required. Request ID of RPC call that need to be canceled.
* **callbacks**. Optional. If it is a function - it will be called if successfully sent canceling message
            or it can be hash table of callbacks:

          { onSuccess: will be called if successfully sent canceling message
            onError: will be called if some error occurred }
* **advancedOptions**. Optional parameter. Must include any or all of the options:

          { mode: string|one of the possible modes:
                  "skip" | "kill" | "killnowait". Skip is default. }

```javascript
ws.call('start.migration', null, {
	onSuccess: function (data) {
		console.log('RPC successfully called');
	},
	onError: function (err) {
		console.log('RPC call failed!',err);
	}
});
status = ws.getOpStatus();

ws.cancel(status.reqId);

```

register(topicURI, callbacks)
-----------------------------------------------

RPC registration for invocation. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **callbacks**. Required. If it is a function - it will be treated as rpc itself
             or it can be hash table of callbacks:

           { rpc: registered procedure
             onSuccess: will be called on successful registration
             onError: will be called if registration would be aborted }

Registered PRC during invocation will receive two arguments: payload (may be null), and options object. One attribute
of interest in options is "receive_progress" (boolean), which indicates, that caller is willing to receive progressive
results, if possible. RPC can return no result (undefined), or it must return an array with 2 elements:

* \[0\] element must contain options object or {} if not needed. Possible attribute of options is "progress": true, which
indicates, that it's a progressive result, so there will be more results in future. Be sure to unset "progress"
on last result message.
* \[1\] element can contain result, which can be a simple value, array or object

```javascript
var sqrt_f = function (x) { return [{}, x*x]; };

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

Also wampy supports rpc with asynchronous code, such as some user interactions or xhr, using promises.
For using this functionality in old browsers you should use polyfills,
like [es6-promise](https://github.com/jakearchibald/es6-promise). Check brower support
at [can i use](http://caniuse.com/#search=promise) site.

```javascript
var getUserName = function () {
    return new Promise(function (resolve, reject) {
        /* Ask user to input his username somehow,
           and resolve promise with user input at the end */
        resolve([{}, userInput]);
    });
};

ws.register('get.user.name', getUserName);
```

[Back to TOC](#table-of-contents)

unregister(topicURI, callbacks)
-----------------------------------------------

RPC unregistration from invocations. Supports chaining.

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

Tests and code coverage
=======================

Wampy.js uses mocha and chai for tests and istanbul for code coverage. You can run both from cli

```bash
# run tests with mocha (use your own favorite reporter)
> mocha -R spec
# or use standart npm test command
> npm test

# for code coverage report run
> npm run-script cover
# and then open coverage/lcov-report/index.html

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

* [WAMP specification][]
* [Wiola][] - WAMP Router in Lua on top of nginx/openresty
* [Loowy](https://github.com/KSDaemon/Loowy) - LUA WAMP client
* [msgpack5][] - A msgpack v5 implementation for node.js and the browser,
with extension point support.

[Back to TOC](#table-of-contents)

[WAMP]: http://wamp-proto.org/
[WAMP specification]: http://wamp-proto.org/
[Wiola]: http://ksdaemon.github.io/wiola/
[msgpack5]: https://github.com/mcollina/msgpack5

[npm-url]: https://www.npmjs.com/package/wampy
[npm-image]: https://img.shields.io/npm/v/wampy.svg?style=flat

[travis-url]: https://travis-ci.org/KSDaemon/wampy.js
[travis-image]: https://img.shields.io/travis/KSDaemon/wampy.js/dev.svg?style=flat

[coveralls-url]: https://coveralls.io/github/KSDaemon/wampy.js
[coveralls-image]: https://img.shields.io/coveralls/KSDaemon/wampy.js/dev.svg?style=flat

[depstat-url]: https://david-dm.org/KSDaemon/wampy.js
[depstat-image]: https://david-dm.org/KSDaemon/wampy.js.svg?style=flat

[depstat-dev-url]: https://david-dm.org/KSDaemon/wampy.js
[depstat-dev-image]: https://david-dm.org/KSDaemon/wampy.js/dev-status.svg?style=flat

[gitter-url]: https://gitter.im/KSDaemon/wampy.js
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT

[DefinitelyTyped.org]: http://definitelytyped.org/
