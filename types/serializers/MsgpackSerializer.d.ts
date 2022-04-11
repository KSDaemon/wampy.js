/// <reference types="bl" />
/// <reference types="node" />
import { Serializer } from "../typedefs";
export declare class MsgpackSerializer implements Serializer {
    protocol: string;
    isBinary: boolean;
    constructor();
    encode(data: any): import("bl");
    decode(data: ArrayBuffer | Buffer): Promise<unknown>;
}
//# sourceMappingURL=MsgpackSerializer.d.ts.map