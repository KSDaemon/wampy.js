import { unpack, pack } from 'msgpackr';
import type { Serializer } from './serializer.js';

export class MsgpackSerializer implements Serializer {
    protocol: string = 'msgpack';
    isBinary: boolean = true;

    encode (data: unknown): Buffer {
        return pack(data);
    }

    decode (data: string | ArrayBuffer | Uint8Array): unknown {
        return unpack(new Uint8Array(data as ArrayBuffer));
    }
}
