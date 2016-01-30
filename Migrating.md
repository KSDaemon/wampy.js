Migrating from previous versions
================================

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
