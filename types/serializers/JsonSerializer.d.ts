import { Dict, Serializer } from "../typedefs";
export declare class JsonSerializer implements Serializer {
    readonly protocol: string;
    readonly isBinary: boolean;
    constructor();
    encode(data: Dict | any[]): string;
    decode(data: string): Promise<Dict>;
}
export default JsonSerializer;
//# sourceMappingURL=JsonSerializer.d.ts.map