/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

var TIMEOUT = 15,

    sendData = require('./send-data'),
    sendDataCursor = 0,

    clientMessageQueue = [],
    openTimer = null,
    sendTimer = null,

    root = (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') ?
        global : window,

    WebSocket = function (url, protocols) {
        this.url = url;
        this.protocols = protocols;
        this.transportEncoding = this.protocols[0].split('.')[2];

        if (this.transportEncoding === 'msgpack') {
            this.binaryType = 'arraybuffer';
            this.encoder = require('msgpack5')();
            this.encode = this.encoder.encode;
            this.decode = this.encoder.decode;
        } else {
            this.encoder = JSON;
            this.encode = this.encoder.stringify;
            this.decode = this.encoder.parse;
        }

        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        this.onopen = null;

        this.protocol = '';

        this.readyState = 1;    // Closed

        var self = this;

        openTimer = root.setTimeout(function () {
            self.protocol = 'wamp.2.' + self.transportEncoding;
            self.onopen();
        }, TIMEOUT);

    };

function clearTimers () {
    if (openTimer) {
        root.clearTimeout(openTimer);
        openTimer = null;
    }

    if (sendTimer) {
        root.clearInterval(sendTimer);
        sendTimer = null;
    }
}

function resetCursor () {
    sendDataCursor = 0;
}

function processQueue () {
    var f;

    if (clientMessageQueue.length) {
        f = clientMessageQueue.shift();
        f();
    }
}

function startTimers () {
    sendTimer = root.setInterval(processQueue, TIMEOUT);
}

WebSocket.prototype.close = function (code, reason) {
    var self = this;

    if (openTimer) {
        root.clearTimeout(openTimer);
        openTimer = null;
    }
    this.readyState = 3;    // Closed
    self.onclose();
};

WebSocket.prototype.abort = function () {
    var self = this;

    if (openTimer) {
        root.clearTimeout(openTimer);
        openTimer = null;
    }
    this.readyState = 3;    // Closed
    self.onerror();
};

WebSocket.prototype.send = function (data) {
    var self = this, send_data, enc_data, rec_data, i;

    rec_data = self.decode(data);
    send_data = sendData[sendDataCursor++];

    // console.log('Data to send to server:', rec_data);
    //console.log('Is silent:', send_data.silent ? 'yes' : 'no');
    if (send_data.silent) {
        return;
    }

    // console.log('Data to send to client:', send_data.data, ' sendDataCursor: ', sendDataCursor);

    if (send_data.data) {
        // Prepare answer (copy request id from request to answer, etc)
        if (send_data.from) {
            i = send_data.from.length;
            while (i--) {
                send_data.data[send_data.to[i]] = rec_data[send_data.from[i]];
            }
        }
        enc_data = { data: self.encode(send_data.data) };
    }

    clientMessageQueue.push(
        function () {
            if (send_data.data) {
                self.onmessage(enc_data);
            }

            //console.log('processsing message: data? ', send_data.data ? 'yes' : 'no',
            //    ' next? ', send_data.next ? 'yes' : 'no',
            //    ' abort? ', send_data.abort ? 'yes' : 'no',
            //    ' close? ', send_data.close ? 'yes' : 'no')
            if (send_data.next) {           // Send to client next message
                self.send(data);
            } else if (send_data.abort) {   // Abort ws connection
                self.abort();
            } else if (send_data.close) {   // Close ws connection
                self.close();
            }
        }
    );
};

module.exports = { WebSocket: WebSocket, startTimers: startTimers, clearTimers: clearTimers, resetCursor: resetCursor };

