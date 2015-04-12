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

    });

})
