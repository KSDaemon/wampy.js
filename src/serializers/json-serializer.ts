import type { Serializer } from './serializer.js';

export class JsonSerializer implements Serializer {
    protocol: string = 'json';
    isBinary: boolean = false;

    encode (data: unknown): string {
        return JSON.stringify(data);
    }

    decode (data: string | ArrayBuffer | Uint8Array): unknown {
        return JSON.parse(data as string);
    }
}
