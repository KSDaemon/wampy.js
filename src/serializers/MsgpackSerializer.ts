import msgpack5 from "msgpack5";
import { Dict, Serializer } from "../typedefs";

const msgpack = msgpack5();

export class MsgpackSerializer implements Serializer {
    protocol: string;
    isBinary: boolean;
    constructor() {
        this.protocol = "msgpack";
        this.isBinary = true;
    }

    encode(data: any) {
        return msgpack.encode(data);
    }

    decode(data: ArrayBuffer | Buffer): Promise<Dict> {
        return new Promise((resolve) => {
            const type = data.constructor.name;

            if (type === "ArrayBuffer" || type === "Buffer") {
                resolve(msgpack.decode(Buffer.from(new Uint8Array(data))));
            } else {
                const reader = new FileReader();

                reader.onload = function () {
                    resolve(
                        msgpack.decode(
                            Buffer.from(
                                new Uint8Array(this.result as ArrayBufferLike)
                            )
                        )
                    );
                };

                reader.readAsArrayBuffer(data as unknown as Blob);
            }
        });
    }
}
export default MsgpackSerializer;
