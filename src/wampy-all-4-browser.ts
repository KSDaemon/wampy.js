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

declare global {
     
    var JsonSerializer: typeof import('./serializers/json-serializer.js').JsonSerializer;
     
    var MsgpackSerializer: typeof import('./serializers/msgpack-serializer.js').MsgpackSerializer;
     
    var CborSerializer: typeof import('./serializers/cbor-serializer.js').CborSerializer;
     
    var WampyCryptosign: typeof import('./auth/cryptosign/wampy-cryptosign.js');
}

globalThis.JsonSerializer = JsonSerializer;
globalThis.MsgpackSerializer = MsgpackSerializer;
globalThis.CborSerializer = CborSerializer;
// window.WampyCra = wampyCra;
globalThis.WampyCryptosign = wampyCryptosign;
