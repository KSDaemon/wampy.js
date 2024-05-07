export class FakeWampyMock {
    constructor (url, options) {
        this.url = url;
        this.options = options;
    }

    async connect () {}

    async disconnect () {
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

    async subscribe (topic) {
        return {
            topic,
            requestId: Math.random() * 1000,
            subscriptionId: Math.random() * 1000,
            subscriptionKey: topic
        };
    }

    async publish (topic) {
        return {
            topic,
            requestId: Math.random() * 1000,
            publicationId: Math.random() * 1000
        };
    }

    async register (topic, rpc) {
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

    async call (topic, payload, options) {
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
