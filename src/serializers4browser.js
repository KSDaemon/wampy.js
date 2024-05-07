/**
 * Wrapper for browser usage of Serializers
 * Set window global variables
 **/
import { MsgpackSerializer } from './serializers/msgpack-serializer.js';
import { CborSerializer } from './serializers/cbor-serializer.js';
window.MsgpackSerializer = MsgpackSerializer;
window.CborSerializer = CborSerializer;
