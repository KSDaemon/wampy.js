import { decode, encode } from 'cbor-x';

export class CborSerializer {
    constructor () {
        this.protocol = 'cbor';
        this.isBinary = true;
    }

    encode (data) {
        return encode(data);
    }

    decode (data) {
        return decode(new Uint8Array(data));
    }
}
