wampy.js
========

Feature-rich WAMP (WebSocket Application Messaging Protocol) Javascript implementation (Browser and node.js)

[![NPM version][npm-image]][npm-url]
[![Build Status][gh-build-test-image]][gh-build-test-url]
[![Code coverage][coveralls-image]][coveralls-url]
[![MIT License][license-image]][license-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]

Table of Contents
=================

- [wampy.js](#wampyjs)
- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Usage example](#usage-example)
- [Installation](#installation)
- [Updating versions](#updating-versions)
- [API](#api)
  - [Constructor([url[, options]])](#constructorurl-options)
  - [options([opts])](#optionsopts)
  - [getOpStatus()](#getopstatus)
  - [getSessionId()](#getsessionid)
  - [connect([url])](#connecturl)
  - [disconnect()](#disconnect)
  - [abort()](#abort)
  - [Ticket-based Authentication](#ticket-based-authentication)
  - [Challenge Response Authentication](#challenge-response-authentication)
  - [Cryptosign-based Authentication](#cryptosign-based-authentication)
  - [Automatically chosen Authentication](#automatically-chosen-authentication)
  - [subscribe(topicURI, onEvent[, advancedOptions])](#subscribetopicuri-onevent-advancedoptions)
  - [unsubscribe(topicURI[, onEvent])](#unsubscribetopicuri-onevent)
  - [publish(topicURI[, payload[, advancedOptions]])](#publishtopicuri-payload-advancedoptions)
  - [call(topicURI[, payload[, advancedOptions]])](#calltopicuri-payload-advancedoptions)
  - [cancel(reqId[, advancedOptions])](#cancelreqid-advancedoptions)
  - [register(topicURI, rpc[, advancedOptions])](#registertopicuri-rpc-advancedoptions)
  - [unregister(topicURI)](#unregistertopicuri)
  - [errors handling](#errors-handling)
- [Using custom serializer](#using-custom-serializer)
- [Connecting through TLS in node environment](#connecting-through-tls-in-node-environment)
- [Tests and code coverage](#tests-and-code-coverage)
- [Copyright and License](#copyright-and-license)
- [See Also](#see-also)

Description
===========

Wampy.js is javascript library, that runs both in browser and node.js environments, and even in react native
environment. It implements [WAMP][] v2 specification on top of WebSocket object, also provides additional
features like auto-reconnecting. It has no external dependencies (by default) and is easy to use.

Wampy.js supports next WAMP roles and features:

* Authentication:
    * Ticket-based Authentication
    * Challenge Response Authentication (wampcra method)
    * Cryptosign-based Authentication (cryptosign method)
* publisher:
    * subscriber blackwhite listing
    * publisher exclusion
    * publisher identification
    * payload passthru mode
* subscriber:
    * pattern-based subscription
    * publication trust levels
    * publisher identification
    * payload passthru mode
* caller:
    * caller identification
    * progressive call results
    * call canceling
    * call timeout
    * payload passthru mode
* callee:
    * caller identification
    * call trust levels
    * pattern-based registration
    * shared registration
    * payload passthru mode

Wampy supports next serializers:

* JSON (default, native)
* MsgPack (See [msgpack5][] for more info)
* CBOR (See [cbor][] for more info)
* Any new serializer can be added easily

[Back to TOC](#table-of-contents)

Usage example
=============

```javascript
const wampy = new Wampy('/ws/', { realm: 'AppRealm' });
try {
    await wampy.connect();
} catch (e) {
    console.log('connection failed', e);
}

try {
    await wampy.subscribe('system.monitor.update', function (eventData) { console.log('Received system.monitor.update event!', eventData); });
} catch (e) {
    console.log('subscription failed', e);
}

try {
    let res = await wampy.call('get.server.time');
    console.log('RPC successfully called');
    console.log('Server time is ' + res.argsDict.serverTime);
} catch (e) {
    console.log('RPC call failed', e);
}

// Somewhere else for example
await wampy.publish('system.monitor.update');

// or just ignore promise (if you don't need it)
wampy.publish('client.message', 'Hi guys!');
```

[Back to TOC](#table-of-contents)

Installation
============

Wampy.js can be installed using `surprisingly` npm :)

```bash
> npm install wampy
```

For simple browser usage just download the latest [browser.zip](../../releases/latest) archive and
add wampy-all.min.js file to your page. It contains msgpack encoder plus wampy itself.

```html
<script src="browser/wampy-all.min.js"></script>
```

In case, you don't plan to use msgpack, just include clean wampy.min.js.

```html
<script src="browser/wampy.min.js"></script>
```

In case you are using any kind of build tools and bundlers, like grunt/gulp/webpack/rollup/vite/etc,
your entry point can be **src/wampy.js** if you transpile you code somehow, or **dist/wampy.js** (default package
entry point) which is already transpiled to "env" preset, so it is working out of the box, just bundle modules.

[Back to TOC](#table-of-contents)

Updating versions
=================

Please refer to [Migrating.md](Migrating.md) for instructions on upgrading major versions.

[Back to TOC](#table-of-contents)

API
===

Below is a description of exposed public API.
Btw, wampy has a type definitions, available at [DefinitelyTyped.org][].
(_Unfortunately, they are for < 7.x versions only for now. Feel free to update!_)

Constructor([url[, options]])
------------------------------------------

Wampy constructor can take 2 parameters:

* **url** to wamp server - optional. URL can be specified in next forms:
    * Undefined/null. In browser environment page-scheme://page-server:page-port/ws will be used in this case.
    * String, begins with '/', meaning some path on current scheme://host:port.
    * Full qualified URL, starting with scheme 'ws' or 'wss'.
    * Host/domain with possible path, but without scheme. In browser environment page-scheme will be used.
* **options** hash-table. The only required field is `realm`. For node.js environment also necessary to
specify `ws` - websocket module. See description below.

```javascript
// in browser
wampy = new Wampy();
wampy = new Wampy('/my-socket-path');
wampy = new Wampy('wss://socket.server.com:5000/ws', { autoReconnect: false });
wampy = new Wampy({ reconnectInterval: 1*1000 });

// in node.js
w3cws = require('websocket').w3cwebsocket;
wampy = new Wampy(null, { ws: w3cws });
wampy = new Wampy('/my-socket-path', { ws: w3cws });
wampy = new Wampy('wss://socket.server.com:5000/ws', { autoReconnect: false, ws: w3cws });
wampy = new Wampy({ reconnectInterval: 1*1000, ws: w3cws });
```

Json serializer will be used by default. If you want to use msgpack or other serializer, pass it through options.
Also, you can use your own serializer. Just be sure, it is supported on WAMP router side!

```javascript
// in browser
wampy = new Wampy('wss://socket.server.com:5000/ws', {
    serializer: new MsgpackSerializer()
});
wampy = new Wampy({
    serializer: new MsgpackSerializer()
});

// in node.js
import {Wampy} from 'wampy';
import {MsgpackSerializer} from 'wampy/dist/serializers/MsgpackSerializer';
import {w3cws} from 'websocket';

wampy = new Wampy('wss://socket.server.com:5000/ws', {
    ws: w3cws,
    serializer: new MsgpackSerializer()
});
wampy = new Wampy({
    ws: w3cws,
    serializer: new MsgpackSerializer()
});

```

[Back to TOC](#table-of-contents)

options([opts])
---------------

.options() method can be called in two forms:

* without parameters, it will return current options
* with one parameter as hash-table it will set new options and return Wampy instance back

Options attributes description:

* **debug**. Default value: false. Enable debug logging.
* **logger**. Default value: null. User-provided logging function. If `debug=true` and no `logger` specified,
`console.log` will be used.
* **autoReconnect**. Default value: true. Enable auto reconnecting. In case of connection failure, Wampy will
try to reconnect to WAMP server, and if you were subscribed to any topics,
or had registered some procedures, Wampy will resubscribe to that topics and reregister procedures.
* **reconnectInterval**. Default value: 2000 (ms). Reconnection Interval in ms.
* **maxRetries**. Default value: 25. Max reconnection attempts. After reaching this value [.disconnect()](#disconnect)
will be called. Set to 0 to disable limit.
* **realm**. Default value: null. WAMP Realm to join on server. See WAMP spec for additional info.
* **helloCustomDetails**. Default value: null. Custom attributes to send to router on hello.
* **uriValidation**. Default value: strict. Can be changed to `loose` for less strict URI validation.
* **authid**. Default value: null. Authentication (user) id to use in challenge.
* **authmethods**. Default value: []. Array of strings of supported authentication methods.
* **authextra**. Default value: {}. Additional authentication options for Cryptosign-based authentication.
See [Cryptosign-based Authentication](#cryptosign-based-authentication) section and [WAMP Spec CS][] for more info.
* **authPlugins**. Default value: {}. Authentication helpers for processing different authmethods flows.
It's a hash-map, where key is an authentication method and value is a function, that takes the necessary user
secrets/keys and returns a function which accepts authmethod and challenge info and returns signed challenge answer.
You can provide your own sign functions or use existing helpers. Functions may be asynchronous.

```javascript
const wampyCra = require('wampy-cra');
const wampyCryptosign = require('wampy-cryptosign');

wampy.options({
    authPlugins: {
        // No need to process challenge data in ticket flow, as it is empty
        ticket: (function(userPassword) { return function() { return userPassword; }})(),
        wampcra: wampyCra.sign(secret),
        cryptosign: wampyCryptosign.sign(privateKey)
    },
    authMode: 'auto'
});
```

* **authMode**. Default value: `manual`. Possible values: `manual`|`auto`. Mode of authorization flow. If it is set
to `manual` - you also need to provide **onChallenge** callback, which will process authorization challenge. Or you
can set it to `auto` and provide **authPlugins** (described above). In this case the necessary authorization flow
will be chosen automatically. This allows to support few authorization methods simultaneously.
* **onChallenge**. Default value: null. Callback function.
It is fired when wamp server requests authentication during session establishment.
This function receives two arguments: auth method and challenge details.
Function should return computed signature, based on challenge details.
See [Challenge Response Authentication](#challenge-response-authentication) section, [WAMP Spec CRA][],
[Cryptosign-based Authentication](#cryptosign-based-authentication) section and [WAMP Spec CS][] for more info.
This function receives welcome details as an argument.
* **onClose**. Default value: null. Callback function. Fired on closing connection to wamp server.
* **onError**. Default value: null. Callback function. Fired on error in websocket communication.
* **onReconnect**. Default value: null. Callback function. Fired every time on reconnection attempt.
* **onReconnectSuccess**. Default value: null. Callback function. Fired every time when reconnection succeeded.
This function receives welcome details as an argument.
* **ws**. Default value: null. User provided WebSocket class. Useful in node environment.
* **additionalHeaders**. Default value: null. User provided additional HTTP headers (for use in Node.js environment)
* **wsRequestOptions**. Default value: null. User provided WS Client Config Options (for use in Node.js environment). See
docs for [WebSocketClient][], [tls.connect options][]
* **serializer**. Default value: JsonSerializer. User provided serializer class. Useful if you plan to use other encoders
instead of default `json`.
* **payloadSerializers**. Default value: `{ json: jsonSerializer }`. User provided hashmap of serializer instances for
using in Payload Passthru Mode. Allows to specify a few serializers and use them on per message/call basis.


```javascript
wampy.options();

wampy.options({
    reconnectInterval: 1000,
    maxRetries: 999,
    onClose: function () { console.log('See you next time!'); },
    onError: function () { console.log('Breakdown happened'); },
    onReconnect: function () { console.log('Reconnecting...'); },
    onReconnectSuccess: function (welcomeDetails) { console.log('Reconnection succeeded. Details:', welcomeDetails); }
});
```

[Back to TOC](#table-of-contents)

getOpStatus()
---------------

Returns the status of last operation. This method returns an object with attributes:

* `code` is integer, and value > 0 means error.
* `error` is Error instance of last operation. Check errors types exposed by wampy.
* `reqId` is a Request ID of last successful operation. It is useful in some cases (call canceling for example).

```javascript
let defer = ws.publish('system.monitor.update');
console.log(ws.getOpStatus());
// may return
//    { code: 1, error: UriError instance }
// or { code: 2, error: NoBrokerError }
// or { code: 0, error: null }
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

Connects to wamp server. **url** parameter is the same as specified in [Constructor](#constructorurl-options).
Returns `promise`:

* Resolved with connection details provided by server (roles, features, authentication details)
* Rejected with error happened

```javascript
try {
    await wampy.connect();
} catch (e) {
    console.log('connection failed', e);
}

await ws.connect('/my-socket-path');

let defer = ws.connect('wss://socket.server.com:5000/ws');
```

[Back to TOC](#table-of-contents)

disconnect()
------------

Disconnects from wamp server. Clears all queues, subscription, calls. Returns `promise`:

* Resolved when wampy disconnects from WAMP server and closes websocket connection
* Rejected with error happened (probably never)


```javascript
await ws.disconnect();
```

[Back to TOC](#table-of-contents)

abort()
------------

Aborts WAMP session and closes a websocket connection.
If it is called on handshake stage - it sends the `abort` message to wamp server (as described in spec).
Also clears all queues, subscription, calls. Returns wampy instance back.

```javascript
ws.abort();
```

[Back to TOC](#table-of-contents)

Ticket-based Authentication
---------------------------

With Ticket-based authentication, the client needs to present the server an authentication "ticket" -
some magic value to authenticate itself to the server. It can be user password, authentication token or
any other kind of client secret. To use it you need to provide "ticket" in "authmethods", authid and
onChallenge callback as wampy instance options.

```javascript
'use strict';

/**
 * Ticket authentication
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'joe',
    authmethods: ['ticket'],
    onChallenge: (method, info) => {
        console.log('Requested challenge with ', method, info);
        return 'joe secret key or password';
    }
});

/**
 * Promise-based ticket authentication
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'micky',
    authmethods: ['ticket'],
    onChallenge: (method, info) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Requested challenge with ', method, info);
                resolve('micky secret key or password');
            }, 2000);
        });
    }
});
```

Challenge Response Authentication
---------------------------------

Wampy.js supports challenge response authentication. To use it you need to provide authid and onChallenge callback
as wampy instance options. Also, Wampy.js supports `wampcra` authentication method with a little helper
plugin "[wampy-cra][]". Just add "wampy-cra" package and use provided methods as shown below.

```javascript
'use strict';

const Wampy = require('wampy').Wampy;
const wampyCra = require('wampy-cra');
const w3cws = require('websocket').w3cwebsocket;

/**
 * Manual authentication using signed message
 */
wampy = new Wampy('wss://wamp.router.url', {
    ws: w3cws,  // just for example in node.js env
    realm: 'realm1',
    authid: 'joe',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        console.log('Requested challenge with ', method, info);
        return wampyCra.signManual('joe secret key or password', info.challenge);
    }
});

/**
 * Promise-based manual authentication using signed message
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'micky',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Requested challenge with ', method, info);
                resolve(wampyCra.signManual('micky secret key or password', info.challenge));
            }, 2000);
        });
    }
});

/**
 * Manual authentication using salted key and pbkdf2 scheme
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'peter',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        const iterations = 100;
        const keylen = 16;
        const salt = 'password salt for user peter';

        console.log('Requested challenge with ', method, info);
        return wampyCra.signManual(wampyCra.deriveKey('peter secret key or password', salt, iterations, keylen), info.challenge);
    }
});

/**
 * Automatic CRA authentication
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'patrik',
    authmethods: ['wampcra'],
    onChallenge: wampyCra.sign('patrik secret key or password')
});
```

[Back to TOC](#table-of-contents)

Cryptosign-based Authentication
-------------------------------

Wampy.js supports cryptosign-based authentication. To use it you need to provide `authid`, `onChallenge` callback
and `authextra` as wampy instance options. Also, Wampy.js supports `cryptosign` authentication method
with a little helper plugin "[wampy-cryptosign][]". Just add "wampy-cryptosign" package and use provided methods
as shown below.

The `authextra` option may contain the following properties for WAMP-Cryptosign:

| Field            | Type   | Required | Description                                                                                                                                                                                                                                   |
|------------------|--------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| pubkey           | string | yes      | The client public key (32 bytes) as a Hex encoded string, e.g. `545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122`                                                                                                             |
| channel_binding* | string | no       | If TLS channel binding is in use, the TLS channel binding type, e.g. `"tls-unique"`.                                                                                                                                                          |
| challenge        | string | no       | A client chosen, random challenge (32 bytes) as a Hex encoded string, to be signed by the router.                                                                                                                                             |
| trustroot        | string | no       | When the client includes a client certificate, the Ethereum address of the trustroot of the certificate chain to be used, e.g. `0x72b3486d38E9f49215b487CeAaDF27D6acf22115`, which can be a *Standalone Trustroot* or an *On-chain Trustroot* |

*: `channel_binding` is not supported yet. And may be supported only in node.js environment.

```javascript
'use strict';

import { Wampy } from 'wampy';
import * as wampyCS from 'wampy-cryptosign';
// or you can import only sign method
//import { sign } from 'wampy-cryptosign';

/**
 * Manual authentication using signed message
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'joe',
    authmethods: ['cryptosign'],
    authextra: {
        pubkey: '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122'
    },
    onChallenge: (method, info) => {
        console.log('Requested challenge with ', method, info);
        return wampyCS.sign('joe secret (private) key')(method, info);
    }
});

/**
 * Promise-based manual authentication using signed message
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'micky',
    authmethods: ['cryptosign'],
    authextra: {
        pubkey: '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122'
    },
    onChallenge: (method, info) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Requested challenge with ', method, info);
                resolve(wampyCS.sign('micky secret (private) key')(method, info));
            }, 2000);
        });
    }
});

/**
 * Automatic CryptoSign authentication
 */
wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'patrik',
    authmethods: ['cryptosign'],
    authextra: {
        pubkey: '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122'
    },
    onChallenge: wampyCS.sign('patrik secret (private) key')
});
```

[Back to TOC](#table-of-contents)

Automatically chosen Authentication
-----------------------------------

If you server provides multiple options for authorization, you can configure wampy.js to automatically choose
required authorization flow based on `authmethod` requested by server.
For this flow you need to configure next options:
* `authid`. Authentication id to use in challenge
* `authmethods`. Supported authentication methods
* `authextra`. Additional authentication options
* `authPlugins`. Authentication helpers for processing different authmethods challenge flows
* `authMode`. Mode of authorization flow. Should be set to `auto`
* `onChallenge`. onChallenge callback. Is not used when `authMode=auto`

```javascript
import { Wampy } from 'wampy';
import * as wampyCra from 'wampy-cra';
import * as wampyCS from 'wampy-cryptosign';

wampy = new Wampy('wss://wamp.router.url', {
    realm: 'realm1',
    authid: 'patrik',
    authmethods: ['ticket', 'wampcra', 'cryptosign'],
    authextra: {    // User public key for Cryptosign-based Authentication
        pubkey: '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122'
    },
    authPlugins: {
        ticket: (function(userPassword) { return function() { return userPassword; }})(),
        wampcra: wampyCra.sign(userSecret),
        cryptosign: wampyCS.sign(userPrivateKey)
    },
    authMode: 'auto',
    onChallenge: null
});
```

[Back to TOC](#table-of-contents)

subscribe(topicURI, onEvent[, advancedOptions])
-------------------------------------------------

Subscribes for topicURI events.

Input Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **onEvent**. Published event callback. Will be called on receiving published event with one hash-table
parameter with following attributes:
  * **argsList**: array payload (maybe omitted)
  * **argsDict**: object payload (maybe omitted)
  * **details**: some publication options object.
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **match**: string matching policy ("prefix"|"wildcard")

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **topic**
  * **requestId**
  * **subscriptionId**
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details

```javascript
await ws.subscribe('chat.message.received', function (eventData) { console.log('Received new chat message!', eventData); });

try {
    let res = await ws.subscribe('some.another.topic',
        function (eventData) { console.log('Received topic event', eventData); }
    );
    console.log('Successfully subscribed to topic: ' + res.topic);

} catch (e) {
    console.log('Subscription error:' + e.error);
}
```

[Back to TOC](#table-of-contents)

unsubscribe(topicURI[, onEvent])
----------------------------------

Unsubscribe from topicURI events.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **onEvent**. Published event callback instance to remove, or it can be not specified,
  in this case all callbacks and subscription will be removed.

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **topic**
  * **requestId**
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details

```javascript
const f1 = function (data) { console.log('this was event handler for topic') };
await ws.unsubscribe('subscribed.topic', f1);

let defer = ws.unsubscribe('chat.message.received');
```

[Back to TOC](#table-of-contents)

publish(topicURI[, payload[, advancedOptions]])
-----------------------------------------------

Publish a new event to topic.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **payload**. Publishing event data. Optional. Maybe any single value or array or hash-table object or null. Also, it
is possible to pass array and object-like data simultaneously. In this case pass a hash-table with next attributes:
    * **argsList**: array payload (maybe omitted)
    * **argsDict**: object payload (maybe omitted)
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **exclude**: integer|array WAMP session id(s) that won't receive a published event,
                 even though they may be subscribed
    * **exclude_authid**: string|array Authentication id(s) that won't receive
                        a published event, even though they may be subscribed
    * **exclude_authrole**: string|array Authentication role(s) that won't receive
                          a published event, even though they may be subscribed
    * **eligible**: integer|array WAMP session id(s) that are allowed to receive a published event
    * **eligible_authid**: string|array Authentication id(s) that are allowed to receive a published event
    * **eligible_authrole**: string|array Authentication role(s) that are allowed
                           to receive a published event
    * **exclude_me**: bool flag of receiving publishing event by initiator
                         (if it is subscribed to this topic)
    * **disclose_me**: bool flag of disclosure of publisher identity (its WAMP session ID)
                         to receivers of a published event

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **topic**
  * **requestId**
  * **publicationId**
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details

```javascript
await ws.publish('user.logged.in');
await ws.publish('chat.message.received', 'user message');
await ws.publish('chat.message.received', ['user message1', 'user message2']);
await ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 });
await ws.publish('chat.message.received', ['Private message'], { eligible: 123456789 });

try {
    await ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 });
    console.log('User successfully modified');
} catch (e) {
    console.log('User modification failed', e.error, e.details);
}
```

[Back to TOC](#table-of-contents)

call(topicURI[, payload[, advancedOptions]])
---------------------------------------------

Make an RPC call to topicURI.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **payload**. RPC data. Optional. Maybe any single value or array or hash-table object or null. Also, it
is possible to pass array and object-like data simultaneously. In this case pass a hash-table with next attributes:
    * **argsList**: array payload (maybe omitted)
    * **argsDict**: object payload (maybe omitted)
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **disclose_me**: bool flag of disclosure of Caller identity (WAMP session ID)
                        to endpoints of a routed call
    * **progress_callback**: function for handling intermediate progressive call results
    * **timeout**: integer timeout (in ms) for the call to finish

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **details**: hash-table with some additional details
  * **argsList**: optional array containing the original list of positional result
  elements as returned by the _Callee_
  * **argsDict**: optional hash-table containing the original dictionary of keyword result
  elements as returned by the _Callee_
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details
  * **argsList**: optional array containing the original error payload list as returned
  by the _Callee_ to the _Dealer_
  * **argsDict**: optional hash-table containing the original error
  payload dictionary as returned by the _Callee_ to the _Dealer_

**Important note on progressive call results**:

For getting a progressive call results you need to specify `progress_callback` in `advancedOptions`.
This callback will be fired on every intermediate result. **But** the last one result or error
will be processed on promise returned from the `.call()`. That means that final call result
will be received by call promise `resolve` handler.

```javascript
let result = await ws.call('server.time');
console.log('Server time is ' + result.argsList[0]);

try {
    await ws.call('start.migration');
    console.log('RPC successfully called');
} catch (e) {
    console.log('RPC call failed!', e.error);
}

try {
    await ws.call('restore.backup', { backupFile: 'backup.zip' });
    console.log('Backup successfully restored');
} catch (e) {
    console.log('Restore failed!', e.error, e.details);
}
```

[Back to TOC](#table-of-contents)

cancel(reqId[, advancedOptions]])
---------------------------------

RPC invocation cancelling.

Parameters:

* **reqId**. Required. Request ID of RPC call that need to be canceled.
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **mode**: string|one of the possible modes: "skip" | "kill" | "killnowait". Skip is default.

Returns `boolean` or throws `Error`:

* `true` if successfully sent canceling message
* `Error` if some error occurred

```javascript
let defer = ws.call('start.migration');
defer
    .then((result) => {
        console.log('RPC successfully called');
    })
    .catch((err) => {
        console.log('RPC call failed!', err);
});

status = ws.getOpStatus();

ws.cancel(status.reqId);
```

[Back to TOC](#table-of-contents)

register(topicURI, rpc[, advancedOptions])
------------------------------------------

RPC registration for invocation.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **rpc**. Required. registered procedure.
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **match**: string matching policy ("prefix"|"wildcard")
    * **invoke**: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **topic**
  * **requestId**
  * **registrationId**
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details

Registered PRC during invocation will receive one hash-table argument with following attributes:

* **argsList**: array payload (maybe omitted)
* **argsDict**: object payload (maybe omitted)
* **details**: some invocation options object. One attribute of interest in options is "receive_progress" (boolean),
which indicates, that caller is willing to receive progressive results, if possible. Another one is "trustlevel", which
indicates the call trust level, assigned by dealer (of course if it is configured accordingly).
* **result_handler**: result handler for case when you want to send progressive results.
Just call it with one parameter, same as you return from simple invocation. Also, do not forget to
set options: `{ progress: true }` for intermediate results.
* **error_handler**: error handler for case when you want to send progressive results and caught
some exception or error.

RPC can return no result (undefined), or it must return an object with next attributes:

* **argsList**: array result or single value, (maybe omitted)
* **argsDict**: object result payload (maybe omitted)
* **options**: some result options object. Possible attribute of options is `"progress": true`, which
indicates, that it's a progressive result, so there will be more results in the future.
Be sure to unset "progress" on last result message.

```javascript
const sqrt_f = function (data) { return { argsList: data.argsList[0]*data.argsList[0] } };

await ws.register('sqrt.value', sqrt_f);

try {
    await ws.register('sqrt.value', sqrt_f);
    console.log('RPC successfully registered');
} catch (e) {
    console.log('RPC registration failed!', e);
}
```

Also, wampy supports rpc with asynchronous code, such as some user interactions or xhr, using promises.
For using this functionality in old browsers you should use polyfills,
like [es6-promise](https://github.com/jakearchibald/es6-promise). Check browser support
at [can i use](http://caniuse.com/#search=promise) site.

```javascript
const getUserName = function () {
    return new Promise(function (resolve, reject) {
        /* Ask user to input his username somehow,
           and resolve promise with user input at the end */
        resolve({ argsList: userInput });
    });
};

ws.register('get.user.name', getUserName);
```

Also, it is possible to abort rpc processing and throw error with custom application specific data.
This data will be passed to caller onError callback.

Exception object with custom data may have next attributes:
* **error**. String with custom error uri. Must meet a WAMP Spec URI requirements.
* **details**. Custom details dictionary object.
* **argsList**. Custom arguments array, this will be forwarded to the caller by the WAMP router's
dealer role. In most cases this attribute is used to pass the human-readable message to the client.
* **argsDict**. Custom arguments object, this will be forwarded to the caller by the WAMP router's
dealer role.

**Note:** Any other type of errors (like built in Javascript runtime TypeErrors, ReferenceErrors)
and exceptions are caught by wampy and sent back to the client's side, not just this type of
custom errors. In this case the details of the error can be lost.

```javascript
const getSystemInfo = function () {

    // Application logic

    // for example, you need to get data from db
    // and at this time you can't connect to db
    // you can throw exception with some details for client application

    const UserException = function () {
        this.error = 'app.error.no_database_connection';
        this.details = {
         errorCode: 'ECONNREFUSED',
         errorMessage: 'Connection refused by a remote host.',
         database: 'db',
         host: '1.2.3.4',
         port: 5432,
         dbtype: 'postgres'
       };
        this.argsList = ['Not able to connect to the database.'];
        this.argsDict = {};
    };

    throw new UserException();
};

await wampy.register('get.system.info', getSystemInfo);
try {
    await wampy.call('get.system.info');
} catch (e) {
    console.log('Error happened', e);
}
```

[Back to TOC](#table-of-contents)

unregister(topicURI)
--------------------

RPC unregistration from invocations.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be unregistered.
Must meet a WAMP Spec URI requirements.

Returns `promise`:

* Resolved with one hash-table parameter with following attributes:
  * **topic**
  * **requestId**
* Rejected with one hash-table parameter with following attributes:
  * **error**: string error description
  * **details**: hash-table with some error details

```javascript
await ws.unregister('sqrt.value');

try {
    ws.unregister('sqrt.value');
    console.log('RPC successfully unregistered');
} catch (e) {
    console.log('RPC unregistration failed!', e);
}
```

errors handling
---------------

During wampy instance lifetime there can be many cases when error happens: some
made by developer mistake, some are bound to WAMP protocol violation, some came
from other peers.
Errors that can be caught by wampy instance itself are mostly formalized and are
stored in `opStatus.error`. This allows, for example, convenient handling of different
types of errors:

```javascript
import {Wampy, Errors} from 'wampy';
const wampy = new Wampy('/ws/', { realm: 'AppRealm' });

try {
    await wampy.call('start.migration');
    console.log('RPC successfully called');
} catch (e) {
    console.log('Error happened!');
    if (e instanceof Errors.UriError) {
        // statements to handle UriError exceptions
    } else if (e instanceof Errors.InvalidParamError) {
        // statements to handle InvalidParamError exceptions
    } else if (e instanceof Errors.NoSerializerAvailableError) {
        // statements to handle NoSerializerAvailableError exceptions
    } else {
        // statements to handle any unspecified exceptions
    }
}
```

Wampy package exposes these errors as `Errors`. For a complete list of errors look at
[src/errors.js](./src/errors.js) file.

```javascript
export default Wampy;
export { Wampy, Errors };
```

[Back to TOC](#table-of-contents)

Using custom serializer
=======================

From v5.0 version there is option to provide custom serializer.

Custom serializer instance must meet a few requirements:

* Have a `encode (data)` method, that returns encoded data
* Have a `decode (data)` method, that returns decoded data
* Have a `protocol` string property, that contains a protocol name. This name is concatenated with
"wamp.2." string and is then passed as websocket subprotocol http header.
* Have a `isBinary` boolean property, that indicates, is this a binary protocol or not.

Take a look at [JsonSerializer.js](src/serializers/JsonSerializer.js) or
[MsgpackSerializer.js](src/serializers/MsgpackSerializer.js) as examples.

[Back to TOC](#table-of-contents)

Connecting through TLS in node environment
==========================================

Starting from v6.2.0 version you can pass additional HTTP Headers and TLS parameters to underlying socket connection
in node.js environment. See example below. For `wsRequestOptions` you can pass any option, described in
[tls.connect options][] documentation.

```javascript
const Wampy = require('wampy').Wampy;
const w3cws = require('websocket').w3cwebsocket;

wampy = new Wampy('wss://wamp.router.url:8888/wamp-router', {
    ws: w3cws,
    realm: 'realm1',
    additionalHeaders: {
        'X-ACL-custom-token': 'dkfjhsdkjfhdkjs',
        'X-another-custom-header': 'header-value'
    },
    wsRequestOptions: {
        ca: fs.readFileSync('ca-crt.pem'),
        key: fs.readFileSync('client1-key.pem'),
        cert: fs.readFileSync('client1-crt.pem'),
        host: 'wamp.router.url',
        port: 8888,
        rejectUnauthorized: false,   // this setting allow to connect to untrusted (or self signed) TLS certificate,
        checkServerIdentity: (servername, cert) => {
            // A callback function to be used (instead of the builtin tls.checkServerIdentity() function)
            // when checking the server's hostname (or the provided servername when explicitly set)
            // against the certificate. This should return an <Error> if verification fails.
            // The method should return undefined if the servername and cert are verified.
            if (servername !== 'MyTrustedServerName') {
                return new Error('Bad server!');
            }
        }
    }
});
```

[Back to TOC](#table-of-contents)

Tests and code coverage
=======================

Wampy.js uses mocha and chai for tests and c8/istanbul for code coverage.
Wampy sources are mostly all covered with tests! :)

```bash
# use standard npm test command
> npm test
# or only some tests
> npm run test:node
> npm run test:node-no-crossbar
> npm run test:browser

# for code coverage report run
> npm run cover
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
* [Loowy][] - LUA WAMP client
* [msgpack5][] - A msgpack v5 implementation for node.js and the browser,
with extension point support
* [wampy-cra][] - WAMP Challenge Response Authentication plugin for Wampy.js
* [wampy-cryptosign][] - WAMP Cryptosign-based Authentication plugin for Wampy.js

[Back to TOC](#table-of-contents)

Thanks JetBrains for support! Best IDEs for every language!

[![jetbrains logo]][jetbrains url]

[WAMP]: http://wamp-proto.org/
[WAMP specification]: http://wamp-proto.org/
[Wiola]: http://ksdaemon.github.io/wiola/
[Loowy]: https://github.com/KSDaemon/Loowy
[msgpack5]: https://github.com/mcollina/msgpack5
[cbor]: https://github.com/hildjj/node-cbor
[WAMP Spec CRA]: https://wamp-proto.org/wamp_latest_ietf.html#name-challenge-response-authenti
[WAMP Spec CS]: https://wamp-proto.org/wamp_latest_ietf.html#name-cryptosign-based-authentica
[WebSocketClient]: https://github.com/theturtle32/WebSocket-Node/blob/master/docs/WebSocketClient.md
[tls.connect options]: https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
[wampy-cra]: https://github.com/KSDaemon/wampy-cra
[wampy-cryptosign]: https://github.com/KSDaemon/wampy-cryptosign

[npm-url]: https://www.npmjs.com/package/wampy
[npm-image]: https://img.shields.io/npm/v/wampy.svg?style=flat

[gh-build-test-url]: https://github.com/KSDaemon/wampy.js/actions/workflows/build-and-test.yml
[gh-build-test-image]: https://github.com/KSDaemon/wampy.js/actions/workflows/build-and-test.yml/badge.svg

[coveralls-url]: https://coveralls.io/github/KSDaemon/wampy.js
[coveralls-image]: https://img.shields.io/coveralls/KSDaemon/wampy.js/dev.svg?style=flat

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: http://opensource.org/licenses/MIT

[snyk-image]: https://snyk.io/test/github/KSDaemon/wampy.js/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/KSDaemon/wampy.js?targetFile=package.json

[DefinitelyTyped.org]: http://definitelytyped.org/

[jetbrains logo]: jetbrains.svg
[jetbrains url]: (https://www.jetbrains.com)
