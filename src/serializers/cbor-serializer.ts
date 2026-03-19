import { Encoder, type Options } from 'cbor-x';
import type { Serializer } from './serializer.js';

/**
 * Extended options interface to include int64AsNumber which is supported
 * at runtime by cbor-x but missing from its type declarations.
 */
interface CborxOptions extends Options {
    int64AsNumber?: boolean;
}

const cborxOptions: CborxOptions = {
    useRecords: false,
    mapsAsObjects: true,
    int64AsNumber: true,
    largeBigIntToFloat: true
};

export class CborSerializer implements Serializer {
    protocol: string = 'cbor';
    isBinary: boolean = true;
    encoder: Encoder;

    constructor(options?: CborxOptions) {
        const initOptions = options ?? cborxOptions;
        this.encoder = new Encoder(initOptions as Options);
    }

    encode (data: unknown): Uint8Array {
        return this.encoder.encode(data);
    }

    decode (data: string | ArrayBuffer | Uint8Array): unknown {
        return this.encoder.decode(new Uint8Array(data as ArrayBuffer));
    }
}
