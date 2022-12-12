import { Encoder } from 'cbor-x';

const cborxOptions = {
    useRecords: false,
    mapsAsObjects: true,
    int64AsNumber: true,
    largeBigIntToFloat: true
};

export class CborSerializer {
    constructor (options) {
        this.protocol = 'cbor';
        this.isBinary = true;
        const initOptions = options ? options : cborxOptions;
        this.encoder = new Encoder(initOptions);
    }

    encode (data) {
        return this.encoder.encode(data);
    }

    decode (data) {
        return this.encoder.decode(new Uint8Array(data));
    }
}
