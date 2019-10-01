wampy.js
========

Simple WAMP (WebSocket Application Messaging Protocol) Javascript client-side implementation

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Code coverage][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![DevDependency Status][depstat-dev-image]][depstat-dev-url]
[![MIT License][license-image]][license-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Gitter Chat][gitter-image]][gitter-url]

Table of Contents
=================

* [Description](#description)
* [Usage example](#usage-example)
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
    * [Challenge Response Authentication](#challenge-response-authentication)
    * [subscribe](#subscribetopicuri-callbacks-advancedoptions)
    * [unsubscribe](#unsubscribetopicuri-callbacks)
    * [publish](#publishtopicuri-payload-callbacks-advancedoptions)
    * [call](#calltopicuri-payload-callbacks-advancedoptions)
    * [cancel](#cancelreqid-callbacks-advancedoptions)
    * [register](#registertopicuri-callbacks-advancedoptions)
    * [unregister](#unregistertopicuri-callbacks)
* [Using custom serializer](#using-custom-serializer)
* [Connecting through TLS in node environment](#connecting-through-tls-in-node-environment)
* [Quick comparison to other libs](#quick-comparison-to-other-libs)
* [Tests and code coverage](#tests-and-code-coverage)
* [Copyright and License](#copyright-and-license)
* [See Also](#see-also)

Description
===========

Wampy.js is javascript library, that runs both in browser and node.js enviroments, and even in react native enviroment.
It implements [WAMP][] v2 specification on top of WebSocket object, also provides additional features like
autoreconnecting and use of Chaining Pattern. It has no external dependencies (by default) and is easy to use.

Wampy.js supports next WAMP roles and features:

* Challenge Response Authentication (wampcra method)
* publisher:
    * subscriber blackwhite listing
    * publisher exclusion
    * publisher identification
* subscriber:
    * pattern-based subscription
    * publication trust levels
* caller:
    * caller identification
    * progressive call results
    * call canceling
    * call timeout
* callee:
    * caller identification
    * call trust levels
    * pattern-based registration
    * shared registration

Wampy default serializer is JSON, but it also supports msgpack as serializer.
In that case you need to include msgpack5.js as dependency. See [msgpack5][] for more info.

For WAMP v1 implementation, please see tag v0.1.0.

[Back to TOC](#table-of-contents)

Usage example
=============

```javascript
const ws = new Wampy('/ws/', { realm: 'AppRealm' });
ws.subscribe('system.monitor.update', function (dataArr, dataObj) { console.log('Received system.monitor.update event!'); })
  .subscribe('client.message', function (dataArr, dataObj) { console.log('Received client.message event!'); })

ws.call('get.server.time', null, {
    onSuccess: function (dataArr, dataObj) {
        console.log('RPC successfully called');
        console.log('Server time is ' + dataArr[0]);
    },
    onError: function (err, detailsObj) {
        console.log('RPC call failed with error ' + err);
    }
});

// Somewhere else for example
ws.publish('system.monitor.update');

ws.publish('client.message', 'Hi guys!');
```

[Back to TOC](#table-of-contents)

Installation
============

Wampy.js can be installed using npm or just by file-copy :)

```bash
> npm install wampy
```

For simple browser usage just download latest [browser.zip](../../releases/latest) archive and
add wampy-all.min.js file to your page. It contains msgpack encoder plus wampy itself.

```html
<script src="browser/wampy-all.min.js"></script>
```

In case, you don't plan to use msgpack, just include clean wampy.min.js.

```html
<script src="browser/wampy.min.js"></script>
```

In case you are using any kind of build tools and bundlers, like grunt/gulp/webpack/rollup/etc,
your entry point can be **src/wampy.js** if you transpile you code somehow, or **dist/wampy.js** (default package
entry point) which is already transpiled to "env" preset, so it is working out of the box, just bundle modules.

[Back to TOC](#table-of-contents)

Updating versions
=================

Please refer to [Migrating.md](Migrating.md) for instructions on upgrading major versions.

[Back to TOC](#table-of-contents)

API
===

Below is a description of exposed public API. Btw, wampy has a type definitions, available at [DefinitelyTyped.org][].

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

Json serializer will be used by default. If you want to use msgpack serializer, pass it through options.
Also, you can use your own serializer. Just be sure, it is supported on WAMP router side!

```javascript
// in browser
ws = new Wampy('ws://socket.server.com:5000/ws', {
    serializer: new MsgpackSerializer(msgpack5)
});
ws = new Wampy({
    serializer: new MsgpackSerializer(msgpack5)
});

// in node.js
import {Wampy} from 'wampy';
import {MsgpackSerializer} from 'wampy/dist/serializers/MsgpackSerializer';
import {w3cws} from 'websocket';

const msgpack5 = require('msgpack5');

ws = new Wampy('ws://socket.server.com:5000/ws', {
    ws: w3cws,
    serializer: new MsgpackSerializer(msgpack5())
});
ws = new Wampy({
    ws: w3cws,
    serializer: new MsgpackSerializer(msgpack5())
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
* **realm**. Default value: null. WAMP Realm to join on server. See WAMP spec for additional info.
* **helloCustomDetails**. Default value: null. Custom attributes to send to router on hello.
* **uriValidation**. Default value: strict. Can be changed to loose for less strict URI validation.
* **authid**. Default value: null. Authentication (user) id to use in challenge.
* **authmethods**. Default value: []. Array of strings of supported authentication methods.
* **onChallenge**. Default value: null. Callback function.
Is fired when wamp server requests authentication during session establishment.
This function receives two arguments: auth method and challenge details.
Function should return computed signature, based on challenge details.
See [Challenge Response Authentication](#challenge-response-authentication) section and [WAMP Spec CRA][] for more info.
* **onConnect**. Default value: null. Callback function. Fired when connection to wamp server is established.
This function receives welcome details as an argument.
* **onClose**. Default value: null. Callback function. Fired on closing connection to wamp server.
* **onError**. Default value: null. Callback function. Fired on error in websocket communication.
* **onReconnect**. Default value: null. Callback function. Fired every time on reconnection attempt.
* **onReconnectSuccess**. Default value: null. Callback function. Fired every time when reconnection succeeded.
This function receives welcome details as an argument.
* **ws**. Default value: null. User provided WebSocket class. Useful in node enviroment.
* **additionalHeaders**. Default value: null. User provided additional HTTP headers (for use in Node.js enviroment)
* **wsRequestOptions**. Default value: null. User provided WS Client Config Options (for use in Node.js enviroment). See
docs for [WebSocketClient][], [tls.connect options][]
* **serializer**. Default value: JsonSerializer. User provided serializer class. Useful if you plan to use msgpack encoder
instead of default json.
In practice, [msgpack5][] tested and works well with [Wiola][], [msgpack-lite](https://github.com/kawanet/msgpack-lite)
doesn't work as expected. Feel free to research other variants.

```javascript
ws.options();

ws.options({
    reconnectInterval: 1000,
    maxRetries: 999,
    onConnect: function (welcomeDetails) { console.log('Yahoo! We are online! Details:', welcomeDetails); },
    onClose: function () { console.log('See you next time!'); },
    onError: function () { console.log('Breakdown happened'); },
    onReconnect: function () { console.log('Reconnecting...'); },
    onReconnectSuccess: function (welcomeDetails) { console.log('Reconnection succeeded. Details:', welcomeDetails); }
});
```

[Back to TOC](#table-of-contents)

getOpStatus()
---------------

Returns the status of last operation. Wampy is developed in a such way, that every operation returns **this** even
in case of error to suport chaining. But if you want to know status of last operation, you can call .getOpStatus().
This method returns an object with 2 or 3 attributes: code and description and possible request ID.
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

Challenge Response Authentication
---------------------------------

Wampy.js supports challenge response authentication. To use it you need to provide authid and onChallenge callback
as wampy instance options. Also Wampy.js supports "wampcra" authentication method with a little helper
plugin "[wampy-cra][]". Just add "wampy-cra" package and use provided methods as shown below.

```javascript
'use strict';

const Wampy = require('wampy').Wampy;
const wampyCra = require('wampy-cra');
const w3cws = require('websocket').w3cwebsocket;
let ws;

/**
 * Manual authentication using signed message
 */
ws = new Wampy('ws://wamp.router.url', {
    ws: w3cws,
    realm: 'realm1',
    authid: 'joe',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        console.log('Requested challenge with ', method, info);
        return wampyCra.sign('joe secret key or password', info.challenge);
    },
    onConnect: () => {
        console.log('Connected to Router!');
    }
});

/**
 * Promise-based manual authentication using signed message
 */
ws = new Wampy('ws://wamp.router.url', {
    ws: w3cws,
    realm: 'realm1',
    authid: 'micky',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Requested challenge with ', method, info);
                resolve(wampyCra.sign('micky secret key or password', info.challenge));
            }, 2000);
        });
    },
    onConnect: () => {
        console.log('Connected to Router!');
    }
});

/**
 * Manual authentication using salted key and pbkdf2 scheme
 */
ws = new Wampy('ws://wamp.router.url', {
    ws: w3cws,
    realm: 'realm1',
    authid: 'peter',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        const iterations = 100;
        const keylen = 16;
        const salt = 'password salt for user peter';

        console.log('Requested challenge with ', method, info);
        return wampyCra.sign(wampyCra.derive_key('peter secret key or password', salt, iterations, keylen), info.challenge);
    },
    onConnect: () => {
        console.log('Connected to Router!');
    }
});

/**
 * Automatic method detection authentication
 */
ws = new Wampy('ws://wamp.router.url', {
    ws: w3cws,
    realm: 'realm1',
    authid: 'patrik',
    authmethods: ['wampcra'],
    onChallenge: wampyCra.auto('patrik secret key or password'),
    onConnect: () => {
        console.log('Connected to Router!');
    }
});

/**
 * Promise-based automatic method detection authentication
 */
ws = new Wampy('ws://wamp.router.url', {
    ws: w3cws,
    realm: 'realm1',
    authid: 'vanya',
    authmethods: ['wampcra'],
    onChallenge: (method, info) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Requested challenge with ', method, info);
                resolve(wampyCra.auto('vanya secret key or password')(method, info));
            }, 2000);
        });
    },
    onConnect: () => {
        console.log('Connected to Router!');
    }
});
```

[Back to TOC](#table-of-contents)

subscribe(topicURI, callbacks[, advancedOptions])
-----------------------------

Subscribes for topicURI events. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the topic.
Must meet a WAMP Spec URI requirements.
* **callbacks**. If it is a function - it will be treated as published event callback or
it can be hash table of callbacks:
    * **onSuccess**: will be called when subscription would be confirmed
    * **onError**: will be called if subscription would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details
    * **onEvent**:   will be called on receiving published event with one hash-table parameter with following attributes:
        * **argsList**: array payload (may be omitted)
        * **argsDict**: object payload (may be omitted)
        * **details**: some publication options object.
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **match**: string matching policy ("prefix"|"wildcard")

```javascript
ws.subscribe('chat.message.received', function (msg) { console.log('Received new chat message!'); });

ws.subscribe('some.another.topic', {
   onSuccess: function () { console.log('Successfully subscribed to topic'); },
   onError: function (err) { console.log('Subscription error:' + err.error); },
   onEvent: function (result) { console.log('Received topic event'); }
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
    * **onSuccess**: will be called when unsubscription would be confirmed
    * **onError**: will be called if unsubscribe would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details
    * **onEvent**: published event callback instance to remove or it can be not specified,
                   in this case all callbacks and subscription will be removed.

```javascript
const f1 = function (data) { ... };
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
* **payload**. Publishing event data. Optional. May be any single value or array or hash-table object or null. Also it
is possible to pass array and object-like data simultaneously. In this case pass a hash-table with next attributes:
    * **argsList**: array payload (may be omitted)
    * **argsDict**: object payload (may be omitted)
* **callbacks**. Optional hash table of callbacks:
    * **onSuccess**: will be called when publishing would be confirmed
    * **onError**: will be called if publishing would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details
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
  onError: function (err, details) { console.log('User modification failed', err); }
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
* **payload**. RPC data. Optional. May be any single value or array or hash-table object or null. Also it
is possible to pass array and object-like data simultaneously. In this case pass a hash-table with next attributes:
    * **argsList**: array payload (may be omitted)
    * **argsDict**: object payload (may be omitted)
* **callbacks**. If it is a function - it will be treated as result callback function
             or it can be hash table of callbacks:
    * **onSuccess**: will be called with result on successful call with one hash-table parameter with following attributes:
        * **details**: hash-table with some additional details
        * **argsList**: optional array containing the original list of positional result
                        elements as returned by the _Callee_
        * **argsDict**: optional hash-table containing the original dictionary of keyword result
                        elements as returned by the _Callee_
    * **onError**: will be called if invocation would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details
        * **argsList**: optional array containing the original error payload list as returned
                        by the _Callee_ to the _Dealer_
        * **argsDict**: optional hash-table containing the original error
                        payload dictionary as returned by the _Callee_ to the _Dealer_
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **disclose_me**: bool flag of disclosure of Caller identity (WAMP session ID)
                        to endpoints of a routed call
    * **receive_progress**: bool flag for receiving progressive results. In this case onSuccess function
                        will be called every time on receiving result
    * **timeout**: integer timeout (in ms) for the call to finish

```javascript
ws.call('server.time', null,
    function (result) {
        console.log('Server time is ' + result.argsList[0]);
    }
);

ws.call('start.migration', null, {
    onSuccess: function (result) {
        console.log('RPC successfully called');
    },
    onError: function (err) {
        console.log('RPC call failed!', err.error);
    }
});

ws.call('restore.backup', { backupFile: 'backup.zip' }, {
    onSuccess: function (result) {
        console.log('Backup successfully restored');
    },
    onError: function (err) {
        console.log('Restore failed!', err.error);
    }
});
```

[Back to TOC](#table-of-contents)

cancel(reqId[, callbacks[, advancedOptions]])
-----------------------------------------------

RPC invocation cancelling. Supports chaining.

Parameters:

* **reqId**. Required. Request ID of RPC call that need to be canceled.
* **callbacks**. Optional. If it is a function - it will be called if successfully sent canceling message
            or it can be hash table of callbacks:
    * **onSuccess**: will be called if successfully sent canceling message
    * **onError**: will be called if some error occurred
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **mode**: string|one of the possible modes: "skip" | "kill" | "killnowait". Skip is default.

```javascript
ws.call('start.migration', null, {
    onSuccess: function (result) {
        console.log('RPC successfully called');
    },
    onError: function (err) {
        console.log('RPC call failed!', err.error);
    }
});
status = ws.getOpStatus();

ws.cancel(status.reqId);

```

[Back to TOC](#table-of-contents)

register(topicURI, callbacks[, advancedOptions])
-----------------------------------------------

RPC registration for invocation. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be called.
Must meet a WAMP Spec URI requirements.
* **callbacks**. Required. If it is a function - it will be treated as rpc itself
             or it can be hash table of callbacks:
    * **rpc**: registered procedure
    * **onSuccess**: will be called on successful registration
    * **onError**: will be called if registration would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details
* **advancedOptions**. Optional parameters hash table. Must include any or all of the options:
    * **match**: string matching policy ("prefix"|"wildcard")
    * **invoke**: string invocation policy ("single"|"roundrobin"|"random"|"first"|"last")

Registered PRC during invocation will receive one hash-table argument with following attributes:

* **argsList**: array payload (may be omitted)
* **argsDict**: object payload (may be omitted)
* **details**: some invocation options object. One attribute of interest in options is "receive_progress" (boolean),
which indicates, that caller is willing to receive progressive results, if possible. Another one is "trustlevel", which
indicates the call trust level, assigned by dealer (of course if it is configured accordingly).
* **result_handler**: result handler for case when you want to send progressive results. Just call it with one parameter,
same as you return from simple invocation. Also do not forget to set options: { progress: true } for intermediate results.
* **error_handler**: error handler for case when you want to send progressive results and cought some exception or error.

RPC can return no result (undefined), or it must return an object with next attributes:

* **argsList**: array result or single value, (may be omitted)
* **argsDict**: object result payload (may be omitted)
* **options**: some result options object. Possible attribute of options is "progress": true, which
indicates, that it's a progressive result, so there will be more results in future. Be sure to unset "progress"
on last result message.

```javascript
const sqrt_f = function (data) { return { argsList: data.argsList[0]*data.argsList[0] } };

ws.register('sqrt.value', sqrt_f);

ws.register('sqrt.value', {
    rpc: sqrt_f,
    onSuccess: function (data) {
        console.log('RPC successfully registered');
    },
    onError: function (err) {
        console.log('RPC registration failed!', err.error);
    }
});
```

Also wampy supports rpc with asynchronous code, such as some user interactions or xhr, using promises.
For using this functionality in old browsers you should use polyfills,
like [es6-promise](https://github.com/jakearchibald/es6-promise). Check brower support
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

Also it is possible to abort rpc processing and throw error with custom application specific data.
This data will be passed to caller onError callback.

Exception object with custom data may have next attributes:
* **error**. String with custom error uri. Must meet a WAMP Spec URI requirements.
* **details**. Custom details dictionary object. The details object is used for the future extensibility, and used by the WAMP router. This object not passed to the client. For details see [WAMP specification 6.1](https://tools.ietf.org/html/draft-oberstet-hybi-tavendo-wamp-02#section-6.1)
* **argsList**. Custom arguments array, this will be forwarded to the caller by the WAMP router's dealer role. Most cases this attribute is used to pass the human readable message to the client.
* **argsDict**. Custom arguments object, this will be forwarded to the caller by the WAMP router's dealer role.

For more details see [WAMP specification 9.2.5](https://tools.ietf.org/html/draft-oberstet-hybi-tavendo-wamp-02#section-9.2.5).

**Note:** Any other type of errors (like built in Javascript runtime TypeErrors, ReferenceErrors) and exceptions are catched by wampy and sent back to the client's side, not just this type of custom errors. In this case the details of the error can be lost.

```javascript
const getSystemInfo = function () {

    // Application logic

    // for example, you need to get data from db
    // and at this time you can't connect to db
    // you can throw exception with some details for client application

    const UserException = function () {
        this.error = 'app.error.no_database_connection';
        this.details = {
         errorCode: 'ECONNREFUSED'
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

ws.register('get.system.info', getSystemInfo);
```

[Back to TOC](#table-of-contents)

unregister(topicURI[, callbacks])
-----------------------------------------------

RPC unregistration from invocations. Supports chaining.

Parameters:

* **topicURI**. Required. A string that identifies the remote procedure to be unregistered.
Must meet a WAMP Spec URI requirements.
* **callbacks**. Optional. If it is a function - it will be called on successful unregistration
             or it can be hash table of callbacks:
    * **onSuccess**: will be called on successful unregistration
    * **onError**: will be called if unregistration would be aborted with one hash-table parameter with following attributes:
        * **error**: string error description
        * **details**: hash-table with some error details

```javascript
ws.unregister('sqrt.value');

ws.unregister('sqrt.value', {
    onSuccess: function (data) {
        console.log('RPC successfully unregistered');
    },
    onError: function (err) {
        console.log('RPC unregistration failed!', err.error);
    }
});
```

[Back to TOC](#table-of-contents)

Using custom serializer
=======================

From v5.0 version there is option to provide custom serializer.

Custom serializer instance must meet a few requirements:

* Have a `encode (data)` method, that returns encoded data
* Have a `decode (data)` method, that returns decoded data
* Have a `protocol` string property, that contains a protocol name. This name is concatenated with "wamp.2." string and
 is then passed as websocket subprotocol http header.
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
let ws;

ws = new Wampy('wss://wamp.router.url:8888/wamp-router', {
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
    },
    onConnect: () => {
        console.log('Connected to WAMP Router through TLS!');
    }
});
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
with extension point support
* [wampy-cra][] - WAMP Challenge Response Authentication plugin for Wampy.js

[Back to TOC](#table-of-contents)

Thanks JetBrains for support! Best IDEs for every language!

[![JetBrains](https://user-images.githubusercontent.com/458096/54276284-086cad00-459e-11e9-9684-47536d9520c4.png)](https://www.jetbrains.com/?from=wampy.js)

[WAMP]: http://wamp-proto.org/
[WAMP specification]: http://wamp-proto.org/
[Wiola]: http://ksdaemon.github.io/wiola/
[msgpack5]: https://github.com/mcollina/msgpack5
[WAMP Spec CRA]: https://tools.ietf.org/html/draft-oberstet-hybi-tavendo-wamp-02#section-13.7.2.3
[WebSocketClient]: https://github.com/theturtle32/WebSocket-Node/blob/master/docs/WebSocketClient.md
[tls.connect options]: https://nodejs.org/api/tls.html#tls_tls_connect_options_callback
[wampy-cra]: https://github.com/KSDaemon/wampy-cra

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

[greenkeeper-image]: https://badges.greenkeeper.io/KSDaemon/wampy.js.svg
[greenkeeper-url]: https://greenkeeper.io/

[DefinitelyTyped.org]: http://definitelytyped.org/
