/// <reference types="bl" />
/// <reference types="node" />
import { Dict, Serializer } from "../typedefs";
export declare class MsgpackSerializer implements Serializer {
    protocol: string;
    isBinary: boolean;
    constructor();
    encode(data: any): import("bl");
    decode(data: ArrayBuffer | Buffer): Promise<Dict>;
}
export default MsgpackSerializer;
//# sourceMappingURL=MsgpackSerializer.d.ts.map