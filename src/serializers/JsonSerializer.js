export class JsonSerializer {

    constructor () {
        this.protocol = 'json';
        this.binaryType = 'blob';
    }

    encode (data) {
        return JSON.stringify(data);
    }

    decode (data) {
        return new Promise(resolve => {
            resolve(JSON.parse(data));
        });
    }
}
