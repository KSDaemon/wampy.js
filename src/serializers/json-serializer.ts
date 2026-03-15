import type { Serializer } from './serializer.js';

export class JsonSerializer implements Serializer {
    protocol: string;
    isBinary: boolean;

    constructor () {
        this.protocol = 'json';
        this.isBinary = false;
    }

    encode (data: unknown): string {
        return JSON.stringify(data);
    }

    decode (data: string | ArrayBuffer | Uint8Array): unknown {
        return JSON.parse(data as string);
    }
}
