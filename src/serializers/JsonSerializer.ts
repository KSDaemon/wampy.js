import { Dict, Serializer } from "../typedefs";

export class JsonSerializer implements Serializer {
    public readonly protocol: string;
    public readonly isBinary: boolean;
    constructor() {
        this.protocol = "json";
        this.isBinary = true;
    }

    encode(data: Dict | any[]): string {
        return JSON.stringify(data);
    }

    async decode(data: string): Promise<Dict> {
        return JSON.parse(data);
    }
}

export default JsonSerializer;
