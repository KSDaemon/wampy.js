export class CustomSerializer {

    constructor () {
        this.protocol = 'custom';
        this.binaryType = 'text';
    }

    encode (data) {
        return data;
    }

    decode (data) {
        return data;
    }
}
