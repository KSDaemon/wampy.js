export class JsonCoder {

    constructor () {
        this.protocol = 'json';
    }

    encode(data) {
        return JSON.stringify(data);
    }

    decode(data) {
        return JSON.parse(data);
    }
}