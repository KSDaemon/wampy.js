# wampy-cryptosign

[WAMP][] Cryptosign-based Authentication plugin for [Wampy.js][].

## Description

wampy-cryptosign exposes 3 methods:

* hex2bytes(str). Helper method to convert hex string to bytes array.
* bytes2hex(bytes). Helper method to convert bytes array to hex string.
* **sign(privateKey)**. Probably the only function you need. Used to automatically create a
  Ed25519 signature for challenge message, using private key. This function can be passed as onChallenge callback.

See examples in Wampy.js docs section
["Cryptosign-based Authentication"](../../../README.md#cryptosign-based-authentication)

[Wampy.js]: https://github.com/KSDaemon/wampy.js
[WAMP]: http://wamp-proto.org/
