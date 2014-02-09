wampy.js
========

Simple WAMP (WebSocket Application Messaging Protocol) Javascript client-side implementation

Table of Contents
=================

* [Description](#description)
* [Usage example](#usage-example)
* [Installation](#installation)
* [Methods](#methods)
	* [Constructor](#constructor)
	* [options](#options)
	* [connect](#connect)
	* [disconnect](#disconnect)
	* [prefix](#prefix)
	* [unprefix](#unprefix)
	* [call](#call)
	* [subscribe](#subscribe)
	* [unsubscribe](#unsubscribe)
	* [publish](#publish)
* [Copyright and License](#copyright-and-license)
* [See Also](#see-also)

Description
===========

Wampy.js is client-side javascript library. It implements [WAMP](http://wamp.ws) specification on top
of WebSocket object, also provides additional features like autoreconnecting and use of Chaining Pattern.
It has no external dependencies and is easy to use.

[Back to TOC](#table-of-contents)

Usage example
=============

```javascript

var ws = new Wampy('/ws/');
ws.prefix('admin', '/ws/admin/')
	.prefix('client', '/ws/client/');
	.subscribe('admin:update', function (data) { console.log('Received admin:update event!'); })
	.subscribe('client:message', function (data) { console.log('Received client:message event!'); })

ws.call('admin:addUser', {
	callRes: function (data) {
		console.log('RPC successfully called');
	},
	callErr: function (err, desc) {
		console.log('RPC call failed with error ' + err);
	}
}, 'newUser', 'userPAss', 'user@company.com');

// Somewhere else for example
ws.publish('admin:update', { action: 'addUser', user: 'newUser' });

ws.publish('client:message', 'Hi guys!', true);

```

[Back to TOC](#table-of-contents)

Installation
============

To use Wampy simply add wampy.(min.)?js file to your page.

```html
<script src="wampy.js"></script>
```

[Back to TOC](#table-of-contents)

Methods
========

Constructor([url[, protocols]][, options])
------------------------------------------

Wampy constructor can take 3 parameters:
* url to wamp server - optional. If its undefined, page-schema://page-server:page-port/ws will be used.
Can be in forms of:
	* fully qualified url: schema://server:port/path
	* server:port/path. In this case page schema will be used.
	* /path. In this case page schema, server, port will be used.
* websocket protocols array - optional
* options hash-table - optional. See description.

```javascript
ws = new Wampy();
ws = new Wampy('/my-socket-path');
ws = new Wampy('https://socket.server.com:5000/ws', { autoReconnect: false });
ws = new Wampy({ reconnectInterval: 1*1000 });
```

[Back to TOC](#table-of-contents)

options([opts])
---------------

.options() method can be in two forms:
* without parameters it will return current options
* with one parameter as hash-table it will set new options. Support chaining.

Options attributes description:
* autoReconnect. Default value: true. Enable autoreconnecting.
* reconnectInterval. Default value: 2000 (ms). Reconnection Interval in ms.
* maxRetries. Default value: 25. Max reconnection attempts. After reaching this value [.disconnect()](#disconnect)
will be called
* onConnect. Default value: undefined. Callback function. Fired when connection to wamp server is established.
* onClose. Default value: undefined. Callback function. Fired on closing connection to wamp server.
* onError. Default value: undefined. Callback function. Fired on error in websocket communication.
* onReconnect. Default value: undefined. Callback function. Fired every time on reconnection attempt.

[Back to TOC](#table-of-contents)

connect([url[, protocols]])
---------------------------

Connect to wamp server. url and protocols parameters are the same as in specified in [Constructor](#constructor).
Supports chaining.

[Back to TOC](#table-of-contents)

disconnect()
------------

Disconnect from wamp server. Clears all queues, subscription, calls. Supports chaining.

[Back to TOC](#table-of-contents)

prefix(prefix, uri)
-------------------

Set a prefix (alias) for uri. Supports chaining.

```javascript
ws.prefix('admin', '/ws/admin/');
ws.prefix('chat', '/ws/chat/');
```

[Back to TOC](#table-of-contents)

unprefix(prefix)
----------------

Remove previously saved prefix. Supports chaining.

[Back to TOC](#table-of-contents)

call(procURI, callbacks[, param1, param2, ...])
-----------------------------------------------

Make a RPC call to procURI. Supports chaining.

Parameters:
* procURI. Required. A string that identifies the remote procedure to be called.
Can be in forms of:
	* URI: http://example.com/ws/admin/addUser
	* prefix-form: admin:addUser
* callbacks. Object with 2 attributes: callRes - callback for success call, callErr - callback for error.
If you don't want to call any callbacks, just pass empty object {}
* any number of parameters for rpc.

```javascript
ws.call('https://socket.server.com:5000/chat/notify', {}, 'new message!');

ws.call('admin:addUser', {
	callRes: function (data) {
		console.log('RPC successfully called');
	},
	callErr: function (err, desc) {
		console.log('RPC call failed with error ' + err);
	}
}, 'newUser', 'userPAss', 'user@company.com');

ws.call('chat:notify', {}, 'new message!');
```

[Back to TOC](#table-of-contents)

subscribe(topicURI, callback)
-----------------------------

Subscribe for topicURI events. Supports chaining.

Parameters:
* procURI. Required. A string that identifies the topic.
Can be in forms of:
	* URI: http://example.com/ws/admin/addUser
	* prefix-form: admin:addUser
* callback function with 1 argument. Will be fired on receiving event in this topic.

```javascript

ws.subscribe('http://example.com/ws/chat/message', function (data) { console.log('Received client:message event!'); });

ws.subscribe('client:message', function (data) { console.log('Received client:message event!'); });

```

[Back to TOC](#table-of-contents)

unsubscribe(topicURI[, callback])
-------------------------------

Unsubscribe from topicURI events. Supports chaining.

Parameters:
* procURI. Required. A string that identifies the topic.
Can be in forms of:
	* URI: http://example.com/ws/admin/addUser
	* prefix-form: admin:addUser
* callback function to remove. Optional. If it is not specified, all callbacks will be removed.

```javascript

var f1 = function (data) { ... };
ws.unsubscribe('http://example.com/ws/chat/message', f1);

ws.unsubscribe('client:message');

```

[Back to TOC](#table-of-contents)

publish(topicURI, event[, exclude[, eligible]])
-----------------------------------------------

Publish a new event to topic. Supports chaining.

Parameters:
* procURI. Required. A string that identifies the topic.
Can be in forms of:
	* URI: http://example.com/ws/admin/addUser
	* prefix-form: admin:addUser
* event data to send. Any valid object/string/number.
* exclude parameter can be in two forms:
	* bool (true|false) - to exclude sender for receiving this event (in case sender is subscribed to this topic).
	* array of wamp session ids, which should be excluded from receiving event.
* eligible parameter is array of wamp session ids, which should receive event.

```javascript

ws.publish('test:subscribe1', 'string data');
ws.publish('test:subscribe2', { field1: 'field1', field2: true, field3: 123 }, true);
ws.publish('test:subscribe4', 'event-data', ["NwtXQ8rdfPsydfsewS"]);
ws.publish('test:subscribe5', 'event-data', [], ["NwtXQ8rdfPsysdfewS", "dYqgDl0FthIsdfthjb"]);

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

[Back to TOC](#table-of-contents)
