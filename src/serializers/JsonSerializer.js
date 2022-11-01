export class JsonSerializer {

    constructor () {
        this.protocol = 'json';
        this.isBinary = false;
    }

    encode (data) {
        return JSON.stringify(data);
    }

    decode (data) {
        return JSON.parse(data);
    }
}
