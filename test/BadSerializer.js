export class BadSerializer {

    constructor () {
        this.protocol = 'unsupported';
        this.binaryType = 'text';
    }

    encode (data) {
        return data;
    }

    decode (data) {
        return data;
    }
}
