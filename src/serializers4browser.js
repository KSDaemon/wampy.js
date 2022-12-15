/**
 * Wrapper for browser usage of Serializers
 * Set window global variables
 **/
import { MsgpackSerializer } from './serializers/MsgpackSerializer.js';
import { CborSerializer } from './serializers/CborSerializer.js';
window.MsgpackSerializer = MsgpackSerializer;
window.CborSerializer = CborSerializer;
