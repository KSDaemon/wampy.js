import { unpack, pack } from 'msgpackr';

export class MsgpackSerializer {
    constructor () {
        this.protocol = 'msgpack';
        this.isBinary = true;
    }

    encode (data) {
        return pack(data);
    }

    decode (data) {
        return unpack(new Uint8Array(data));
    }
}
