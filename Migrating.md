Migrating from previous versions
================================

Migrating from 2.x to 3.x versions
==================================

3.0.0 version was updated to current WAMP spec, so there are some backward incompatible changes.

Registered RPC now receives two arguments on invocation: first argument - value, second - options object.
Options object may contain attribute "receive_progress": true, which indicates that client is willing to receive
results in a progressive way. If RPC can send progressive results, it should specify that in returned value, see below.

If registered RPC wants to return a value, it must return an array with two elements: first - options object,
second - value itself.
For simple one-time result, options object should be empty ({}), for progressive results options object for all
intermediate results must contain "progress": true attribute, and no "progress" attribute for final result.

In 3.0.0 next attributes were removed:
* In call method:
    * exclude
    * eligible
    * exclude_me

Migrating from 1.x to 2.x versions
==================================

1. From 2.0.0 version, Wampy does not search for a global msgpack object, so if you were using msgpack encoder,
now you should explicitly pass a msgpack instance via options.
2. From 2.0.0 version, in node.js enviroment you need to explicitly provide a websocket instance.

All necessary libs are included or added as dependencies. See examples below.

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
