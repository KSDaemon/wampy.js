import { unpack, pack } from 'msgpackr';
import type { Serializer } from './serializer.js';

export class MsgpackSerializer implements Serializer {
    protocol: string;
    isBinary: boolean;

    constructor () {
        this.protocol = 'msgpack';
        this.isBinary = true;
    }

    encode (data: unknown): Buffer {
        return pack(data);
    }

    decode (data: string | ArrayBuffer | Uint8Array): unknown {
        return unpack(new Uint8Array(data as ArrayBuffer));
    }
}
