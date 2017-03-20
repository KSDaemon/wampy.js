Migrating from previous versions
================================

Migrating from 4.x to 5.x versions
==================================

5.0.0 version was extended and updated, so there are some backward incompatible changes.

Starting with 5.0.0 version, browser precompiled version is no longer included to dist folder. Most people use 
bundlers, like webpack/rollup or others, so they do not need standalone browser version. You can always download 
it from [releases page](/releases/latest).

First of all, because of rewriting Wampy to ES6 modules, module import slightly changed:
 
```javascript
// WAS:
const Wampy = require('wampy');
//IS NOW:
const Wampy = require('wampy').Wampy;

// If you are using ES6 modules syntax
import { Wampy } from 'wampy';
```

If you use Wampy with msgpack, then you need to update you code for proper serializer initialization.
`msgpackCoder` and `transportEncoding` options was removed. Instead, `serializer` option was added for providing
custom serializer. Just pass a Serializer instance there. Wampy already comes with 2 serializers: 
JsonSerializer (default) and MsgpackSerializer (optional).

```javascript
// WAS:
const msgpack = require('msgpack5')()
const w3cws = require('websocket').w3cwebsocket;
const Wampy = require('wampy');

const wampy = new Wampy(routerUrl, {
                realm: 'AppRealm',
                onConnect: function () { ... },
                ws: w3cws,
                transportEncoding: 'msgpack',
                msgpackCoder: msgpack
            });

//IS NOW:
const w3cws = require('websocket').w3cwebsocket;
const Wampy = require('wampy').Wampy;
const MsgpackSerializer = require('wampy/dist/serializers/MsgpackSerializer').MsgpackSerializer;

const wampy = new Wampy(routerUrl, {
    realm: 'AppRealm',
    onConnect: function () { ... },
    ws: w3cws,
    serializer: new MsgpackSerializer()
});
```

Now registered PRC during invocation will receive three arguments (instead of 2, previously): 
array payload (may be undefined), object payload (may be undefined) and options object. 
Also now RPC can return no result (undefined), or it must return an array with 1, 2 or 3 elements:

* \[0\] element must contain options object or {} if not needed. Possible attribute of options is "progress": true, which
indicates, that it's a progressive result, so there will be more results in future. Be sure to unset "progress"
on last result message.
* \[1\] element can contain array result or single value (that will be converted to array with one element)
* \[2\] element can contain object result

Migrating from 3.x to 4.x versions
==================================

4.0.0 version was extended and updated, so there are some backward incompatible changes.

* Error callbacks now receive more than 1 parameter. In most cases it now is called with (Error|uri|string, Details|object).
In some cases, like CALL, callback is called with (Error|uri|string, Details|object, Arguments|array, ArgumentsKw|object).
* Event callback for subscibed topic now receives 2 parameters: (Arguments|array, ArgumentsKw|object). It allows to receive 
array-like and hash-table payload at the same time. So, if your app is expecting to receive object-like payload in first argument,
now you should add second one, and use it.
* Same rule as above applies to RPC result callback.

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
