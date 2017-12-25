export class JsonSerializer {

    constructor () {
        this.protocol = 'json';
        this.isBinary = true;
    }

    encode (data) {
        return JSON.stringify(data);
    }

    decode (data) {
        return JSON.parse(data);
    }
}
