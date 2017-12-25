import msgpack5 from 'msgpack5';

const msgpack = msgpack5();

export class MsgpackSerializer {
    constructor () {
        this.protocol = 'msgpack';
        this.isBinary = true;
    }

    encode (data) {
        return msgpack.encode(data);
    }

    decode (data) {
        return new Promise(resolve => {

            const type = data.constructor.name;

            if (type === 'ArrayBuffer' || type === 'Buffer') {
                resolve(msgpack.decode(new Uint8Array(data)));
            } else {
                const reader = new FileReader();

                reader.onload = function () {
                    resolve(msgpack.decode(new Uint8Array(this.result)));
                };

                reader.readAsArrayBuffer(data);
            }

        });
    }
}
