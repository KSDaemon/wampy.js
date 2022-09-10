import cbor from 'cbor';

export class CborSerializer {
    constructor () {
        this.protocol = 'cbor';
        this.isBinary = true;
    }

    encode (data) {
        return cbor.encode(data);
    }

    decode (data) {
        return new Promise(resolve => {
            resolve(cbor.decode(data));
        });
    }
}
