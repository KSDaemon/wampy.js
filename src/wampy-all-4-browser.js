/**
 * Wrapper for browser usage of Serializers
 * Set window global variables
 **/
import { JsonSerializer } from './serializers/json-serializer.js';
import { MsgpackSerializer } from './serializers/msgpack-serializer.js';
import { CborSerializer } from './serializers/cbor-serializer.js';
// XXX: This doesn't work because of await import('node:crypto') inside, so browserify fails.
// import * as wampyCra from './auth/wampcra/wampy-cra.js';
import * as wampyCryptosign from './auth/cryptosign/wampy-cryptosign.js';
window.JsonSerializer = JsonSerializer;
window.MsgpackSerializer = MsgpackSerializer;
window.CborSerializer = CborSerializer;
// window.WampyCra = wampyCra;
window.WampyCryptosign = wampyCryptosign;
