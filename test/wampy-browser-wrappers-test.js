import { expect } from 'chai';

describe('Wampy.js with browser distribution wrappers', function () {
    describe('Window object initial state', function () {
        it('should not contain any wrappers inside the global window object', function () {
            expect(window.Wampy).to.be.undefined;
            expect(window.MsgpackSerializer).to.be.undefined;
            expect(window.CborSerializer).to.be.undefined;
        });
    });

    describe('Browser submodule', function () {
        before(async function () { await import('../src/browser.js'); });

        it('should contain Wampy property in the global window object', function () {
            expect(window.Wampy).to.be.a('function');
        });
    });

    describe('Serializers4browser submodule', function () {
        before(async function () { await import('../src/serializers4browser.js'); });

        it('should contain MsgpackSerializer property in the global window object', function () {
            expect(window.MsgpackSerializer).to.be.a('function');
        });

        it('should contain CborSerializer property in the global window object', function () {
            expect(window.CborSerializer).to.be.a('function');
        });
    });
});
