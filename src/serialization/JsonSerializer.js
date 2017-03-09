export class JsonSerializer {

    constructor () {
        this.protocol = 'json';
        this.binaryType = 'blob';
    }

    encode (data) {
        return JSON.stringify(data);
    }

    decode (data) {
        return JSON.parse(data);
    }
}
