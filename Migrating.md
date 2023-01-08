Migrating from previous versions
================================

Migrating from 7.x to 8.x versions
==================================

The `.options()` method has been marked as deprecated. We are still keeping backwards
compatibility, but we recommend to switch to `.getOptions()` and `.setOptions()` instead.

Migrating from 6.x to 7.x versions
==================================

v7 is a huge rewrite of the whole project.
Maybe 7+ years age method chaining was okay, but for now await/async sugar is everywhere,
and it is pretty neat to use it.

So most of the public methods were rewritten to async/await style and now return promises.

1. Wampy constructor now doesn't automatically connect to server. so you need to call
`.connect()` explicitly after Wampy instantiation.
2. Serializers were refactored a bit, so no need to pass additional objects.

    ```javascript
    // Before
    wampy = new Wampy({
        serializer: new MsgpackSerializer(msgpack5)
    });

    // Now
    wampy = new Wampy({
        serializer: new MsgpackSerializer()
    });
    ```

3. `getOpStatus()` answer changed.

    ```javascript
    //Before
    console.log(ws.getOpStatus());
    // may return { code: 1, description: "Topic URI doesn't meet requirements!" }
    // or { code: 2, description: "Server doesn't provide broker role!" }
    // or { code: 0, description: "Success!", reqId: 1565723572 }

    // Now
    console.log(ws.getOpStatus());
    // may return
    //    { code: 1, error: UriError instance }
    // or { code: 2, error: NoBrokerError }
    // or { code: 0, error: null }
    ```

4. `onConnect` callback option was removed. Rely on the promise resolve result

    ```javascript
    //Before
    ws = new Wampy('wss://wamp.router.url', {
       realm: 'realm1',
       onConnect: (details) => {
           console.log('Connected to Router!');
       }
    });

    // Now
    let details = await wampy.connect();
    ```

5. `disconnect()` was promisified.

    ```javascript
    //Before
    wampy.disconnect();

    // Now
    await wampy.disconnect();
    ```

6. `subscribe(topicURI, onEvent[, advancedOptions])` was promisified. `onSucess`, `onError` callbacks
options were removed. Rely on the promise resolution.

    ```javascript
    //Before
    ws.subscribe('chat.message.received', function (eventData) { console.log('Received new chat message!', eventData); });

    ws.subscribe('some.another.topic', {
        onSuccess: function (details) { console.log('Successfully subscribed to topic: ' + details.topic); },
        onError: function (errData) { console.log('Subscription error:' + err.error); },
        onEvent: function (eventData) { console.log('Received topic event', eventData); }
    });

    // Now
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

7. `subscribe(topicURI, onEvent[, advancedOptions])` now returns hash-map with next attributes:

    * topic. Topic URI
    * requestId.
    * subscriptionId. You will need it for unsubscribe
    * subscriptionKey. You will need it for unsubscribe

8. `unsubscribe(topicURI[, onEvent])` method was changed -> `unsubscribe(subscriptionIdKey[, onEvent])`.

    Instead of providing `topic URI` now you need to provide `subscriptionId` or `subscriptionKey`.
    The reason for this change is that you can have a few subscriptions for the same topic but
    with different options, e.g. one subscription with exact topic match and one handler and another
    prefix-based subscription with different handler. Previously you can not have both and also can not
    unsubscribe only one. Now it is possible. And you still may have a few different handlers for the same
    subscription on client side, so `onEvent` option is still present.

9. `unsubscribe(subscriptionIdKey[, onEvent])` was promisified. `onSucess`, `onError` callbacks
   options were removed. Rely on the promise resolution.

    ```javascript
    //Before
    const f1 = function (data) { };
    ws.unsubscribe('subscribed.topic', f1);

    ws.unsubscribe('subscribed.topic', {
        onSuccess: function (details) { console.log('Successfully unsubscribed from topic: ' + details.topic); },
        onError: function (errData) { console.log('Unsubscription error:' + err.error); },
        onEvent: f1
    });

    // Now
    await ws.unsubscribe('subscribed.topic.key', f1);
    try {
        let res = await ws.unsubscribe('some.another.topic.key', f1);
        console.log('Successfully unsubscribed to topic: ' + details.topic);

    } catch (e) {
        console.log('Unsubscription error:' + e.error);
    }
    ```

10. `publish(topicURI[, payload[, advancedOptions]]])` was promisified. `onSucess`, `onError` callbacks
    options were removed. Rely on the promise resolution.

     ```javascript
     //Before
     ws.publish('user.logged.in');
     ws.publish('chat.message.received', 'user message');
     ws.publish('chat.message.received', ['user message1', 'user message2']);
     ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 });
     ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 }, {
         onSuccess: function () { console.log('User successfully modified'); }
     });
     ws.publish('user.modified', { field1: 'field1', field2: true, field3: 123 }, {
         onSuccess: function () { console.log('User successfully modified'); },
         onError: function (errData) { console.log('User modification failed', errData.error, errData.details); }
     });
     ws.publish('chat.message.received', ['Private message'], null, { eligible: 123456789 });

     // Now
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

11. `call(topicURI[, payload[, advancedOptions]]])` was promisified. `onSucess`, `onError` callbacks
    options were removed. Rely on the promise resolution.

     ```javascript
     //Before
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
             console.log('Restore failed!', err.error, err.details);
         }
     });

     // Now
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

12. Progressive call results flow changed. As `call()` was promisified, so for getting a
progressive call results you need to specify `progress_callback` in `advancedOptions`.
This callback will be fired on every intermediate result. **But** the last one result or error
will be processed on promise returned from the `.call()`. That means that final call result
will be received by call promise `resolve` handler.

    ```javascript
    //Before
    ws.call('start.migration', null, {
            onSuccess: function (result) {
                // this function will be called every time with results
                // intermediate and final one
                console.log('RPC successfully called');
            },
            onError: function (err) {
                console.log('RPC call failed!', err.error);
            }
        },
        {
            receive_progress: true
        }
    );

    // Now
    let finalResult = await ws.call('start.migration', null, {
        progress_callback: function (result) {
            // this function will be called every ONLY
            // with intermediate results
            console.log('RPC intermediate result received');
        }
    });
    ```

13. `cancel(reqId[, advancedOptions]])` was promisified. `onSucess`, `onError` callbacks
    options were removed. Rely on the promise resolution. Refer to the docs about returned objects.

    ```javascript
    //Before
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
    // Now
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

14. `register(topicURI, rpc[, advancedOptions])` was promisified. `onSucess`, `onError` callbacks
    options were removed. Rely on the promise resolution. Refer to the docs about returned objects.

    ```javascript
    //Before
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

    // Now
    const sqrt_f = function (data) { return { argsList: data.argsList[0]*data.argsList[0] } };

    await ws.register('sqrt.value', sqrt_f);

    try {
        await ws.register('sqrt.value', sqrt_f);
        console.log('RPC successfully registered');
    } catch (e) {
        console.log('RPC registration failed!', e);
    }
    ```

15. `unregister(topicURI)` was promisified. `onSucess`, `onError` callbacks
    options were removed. Rely on the promise resolution. Refer to the docs about returned objects.

    ```javascript
    //Before
    ws.unregister('sqrt.value');

    ws.unregister('sqrt.value', {
        onSuccess: function (data) {
            console.log('RPC successfully unregistered');
        },
        onError: function (err) {
            console.log('RPC unregistration failed!', err.error);
        }
    });

    // Now
    await ws.unregister('sqrt.value');

    try {
        ws.unregister('sqrt.value');
        console.log('RPC successfully unregistered');
    } catch (e) {
        console.log('RPC unregistration failed!', e);
    }
    ```

Migrating from 5.x to 6.x versions
==================================

6.0.0 version was extended and refactored, so there are backward incompatible changes.

One of the main changes is in API callback methods parameters. In 6.0.0 version, all callbacks receive **one** argument,
 which is an object, containing all necessary data. In most cases, it looks like this:

```javascript
let callbackParams = {
    argsList: [],    // array payload (may be omitted)
    argsDict: {},    // object payload (may be omitted)
    details: {}      // some details specific for API call type (may be empty)
}
```

Next one change is in unifying error callbacks. In 6.0.0 version, all callbacks receive **one** argument,
 which is an object, containing all necessary data. In most cases, it looks like this:

```javascript
let errorObject = {
    error: 'stringURI', // string URI that gives the error of why the request could not be fulfilled
    argsList: [],       // array payload (may be omitted)
    argsDict: {},       // object payload (may be omitted)
    details: {}         // some details specific for API call type (may be empty)
}
```

Subscribe event callback method signature change:

```javascript
// WAS:
ws.subscribe('some.topic', {
   onSuccess: function () { console.log('Successfully subscribed to topic'); },
   onError: function (err, details) { console.log('Subscription error:' + err); },
   onEvent: function (arrayPayload, objectPayload) {
       console.log('Received topic event');
       console.log('Event array payload', arrayPayload);
       console.log('Event object payload', objectPayload);
   }
});

//IS NOW:
ws.subscribe('some.topic', {
   onSuccess: function () { console.log('Successfully subscribed to topic'); },
   onError: function (err) { console.log('Subscription error:' + err.error); },
   onEvent: function (result) {
       console.log('Received topic event');
       console.log('Event array payload', result.argsList);
       console.log('Event object payload', result.argsDict);
       console.log('Event details', result.details);
   }
});
```

RPC Call callback method signature change:

```javascript
// WAS:
ws.call('restore.backup', { backupFile: 'backup.zip' }, {
    onSuccess: function (arrayPayload, objectPayload) {
        console.log('Backup successfully restored');
        console.log('RPC result array payload', arrayPayload);
        console.log('RPC result object payload', objectPayload);
    },
    onError: function (err, details, [arrayData, objectData]) {
        console.log('Restore failed!',err);
    }
});

//IS NOW:
ws.call('restore.backup', { backupFile: 'backup.zip' }, {
    onSuccess: function (result) {
        console.log('Backup successfully restored');
        console.log('RPC result array payload', result.argsList);
        console.log('RPC result object payload', result.argsDict);
        console.log('RPC result details', result.details);
    },
    onError: function (err) {
        console.log('Restore failed!');
        console.log('Error details:', err.error, err.details, err.argsList, err.argsDict);
    }
});
```

RPC registration method signature change:

```javascript
// WAS:
const sqrt_f = function (x) { return [{}, x*x]; };

ws.register('sqrt.value', {
    rpc: sqrt_f,
    onSuccess: function (data) {
        console.log('RPC successfully registered');
    },
    onError: function (err, details) {
        console.log('RPC registration failed!',err);
    }
});

//IS NOW:
const sqrt_f = function (data) { return { argsList: data.argsList[0]*data.argsList[0] } };

ws.register('sqrt.value', {
    rpc: sqrt_f,
    onSuccess: function (data) {
        console.log('RPC successfully registered');
    },
    onError: function (err) {
        console.log('Registration failed!');
        console.log('Error details:', err.error, err.details);
    }
});
```

Wampy instance onError callback method signature change:

```javascript
// WAS:
ws.options({
    onError: function (err) { console.log('Breakdown happened!', err); },
});

//IS NOW:
ws.options({
    onError: function (err) { console.log('Breakdown happened!', err.error); },
});
```

Migrating from 4.x to 5.x versions
==================================

5.0.0 version was extended and updated, so there are some backward incompatible changes.

Starting with 5.0.0 version, browser precompiled version is no longer included to dist folder. Most people use
bundlers, like webpack/rollup or others, so they do not need standalone browser version. You can always download
it from [releases page](../../releases/latest).

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
