import { Dict } from "../typedefs";
export declare class JsonSerializer {
    readonly protocol: string;
    readonly isBinary: boolean;
    constructor();
    encode(data: any): string;
    decode(data: any): Promise<Dict>;
}
export default JsonSerializer;
//# sourceMappingURL=JsonSerializer.d.ts.map