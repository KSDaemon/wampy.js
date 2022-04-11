import { Dict } from "../typedefs";

export class JsonSerializer {
    public readonly protocol: string;
    public readonly isBinary: boolean;
    constructor() {
        this.protocol = "json";
        this.isBinary = true;
    }

    encode(data: any) {
        return JSON.stringify(data);
    }

    async decode(data: any): Promise<Dict> {
        return JSON.parse(data);
    }
}

export default JsonSerializer;
