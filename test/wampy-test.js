/**
 * Project: wampy.js
 * User: KSDaemon
 * Date: 07.04.15
 */

var expect = require('chai').expect,
    WebSocket = require('./fake-ws'),
    Wampy = require('./../src/wampy');

describe('Wampy.js', function () {
    var wampy = new Wampy('/ws/', { realm: 'AppRealm' });

    before(function () {

    })

    describe('Constructor', function () {

        it('allows to connect on instantiation if all required options specified');

        it('disallows to connect on instantiation without url');

        it('disallows to connect on instantiation without realm');

        it('allows to set different options on instantiation');

    });

    describe('Instance', function () {

        it('allows to set different options');

        it('allows to get different options');

        it('allows to get current WAMP Session ID');

        it('allows to disconnect from connected server');

        it('allows to connect to same WAMP server');

        it('allows to connect to different WAMP server');

        it('allows to abort WebSocket/WAMP session establishment');

        describe('PubSub module', function () {

            it('disallows to subscribe to topic with invalid URI');

            it('disallows to subscribe to topic without specifying callback');

            it('allows to subscribe to topic');

            it('allows to subscribe to topic with notification on subscribing');

            it('allows to setup multiple handlers to same topic');

            it('allows to publish event without payload');

            it('allows to publish event with int payload');

            it('allows to publish event with string payload');

            it('allows to publish event with array payload');

            it('allows to publish event with hash-table payload');

            it('allows to publish event with notification on publishing');

            it('allows to publish event with different advanced options');

            it('disallows to publish event to topic with invalid URI');

            it('allows to unsubscribe from topic only specified handler');

            it('allows to unsubscribe all handlers from topic');

            it('allows to unsubscribe from topic with notification on unsubscribing');
        });

        describe('RPC module', function () {

            it('allows to register RPC');

            it('allows to register RPC with notification on registration');

            it('disallows to register RPC with invalid URI');

            it('disallows to call RPC with invalid URI');

            it('disallows to call RPC without specifying result handler');

            it('allows to call RPC without payload');

            it('allows to call RPC with int payload');

            it('allows to call RPC with string payload');

            it('allows to call RPC with array payload');

            it('allows to call RPC with hash-table payload');

            it('allows to call RPC with different advanced options');

            it('allows to call RPC with progressive result receiving');

            it('allows to cancel RPC invocation');

            it('allows to unregister RPC');

            it('allows to unregister RPC with notification on unregistering');
        });

    });

})
