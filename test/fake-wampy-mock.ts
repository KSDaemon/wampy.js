interface FakeWampyOptions {
    onError?: () => void;
    onReconnect?: () => void;
    onReconnectSuccess?: (details: Record<string, unknown>) => void;
    onClose?: () => void;
}

export class FakeWampyMock {
    url: string | undefined;
    options: FakeWampyOptions | undefined;

    constructor (url?: string, options?: FakeWampyOptions) {
        this.url = url;
        this.options = options;
    }

    async connect (): Promise<void> {}

    async disconnect (): Promise<void> {
        if (this.options?.onError) {
            this.options.onError();
        }
        if (this.options?.onReconnect) {
            this.options.onReconnect();
        }
        if (this.options?.onReconnectSuccess) {
            this.options.onReconnectSuccess({});
        }
        if (this.options?.onClose) {
            this.options.onClose();
        }
    }

    async subscribe (topic: string): Promise<{
        topic: string;
        requestId: number;
        subscriptionId: number;
        subscriptionKey: string;
    }> {
        return {
            topic,
            requestId: Math.random() * 1000,
            subscriptionId: Math.random() * 1000,
            subscriptionKey: topic
        };
    }

    async publish (topic: string): Promise<{
        topic: string;
        requestId: number;
        publicationId: number;
    }> {
        return {
            topic,
            requestId: Math.random() * 1000,
            publicationId: Math.random() * 1000
        };
    }

    async register (topic: string, rpc: (data: {
        details: Record<string, unknown>;
        argsList: unknown[];
        argsDict: Record<string, unknown>;
    }) => void): Promise<{
        topic: string;
        requestId: number;
        registrationId: number;
    }> {
        rpc({
            details : {},
            argsList: [],
            argsDict: {}
        });
        return {
            topic,
            requestId: Math.random() * 1000,
            registrationId: Math.random() * 1000
        };
    }

    async call (topic: string, payload?: unknown, options?: {
        progress_callback?: (data: Record<string, unknown>) => void;
    }): Promise<{
        details: Record<string, unknown>;
        argsList: unknown[];
        argsDict: Record<string, unknown>;
    }> {
        if (options?.progress_callback) {
            options.progress_callback({});
        }
        return {
            details: {},
            argsList: [],
            argsDict: {}
        };
    }
}
