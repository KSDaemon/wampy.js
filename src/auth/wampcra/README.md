# wampy-cra

[WAMP][] Challenge Response Authentication plugin for [Wampy.js][].

## Description

wampy-cra exposes 3 methods:

* deriveKey(secret, salt, iterations = 1000, keylen = 32). Used to generate a derived key using PBKDF2 scheme.
* signManual(key, challenge). Used to sign a challenge message, using a key, using SHA256 algorithm.
* **sign(secret)**. Probably the only function you need. Used to automatically create a
signed message, using only secret key. This function can be passed as onChallenge callback.

See examples in Wampy.js docs section
["Challenge Response Authentication"](../../../README.md#challenge-response-authentication)

[Wampy.js]: https://github.com/KSDaemon/wampy.js
[WAMP]: http://wamp-proto.org/
