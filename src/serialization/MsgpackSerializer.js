export class MsgpackSerializer {
    constructor (msgpack) {
        this.protocol = 'msgpack';
        this.binaryType = 'arraybuffer';
        this._msgpack = msgpack;
    }

    encode (data) {
        return this._msgpack.encode(data);
    }

    decode (data) {
        return this._msgpack.decode(new Uint8Array(data));
    }
}
