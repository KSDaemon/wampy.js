import { expect } from 'chai';

describe('Wampy.js with browser distribution wrappers', function () {
    describe('Window object initial state', function () {
        it('should not contain any wrappers inside the global window object', function () {
            expect(globalThis.Wampy).to.be.undefined;
            expect(globalThis.MsgpackSerializer).to.be.undefined;
            expect(globalThis.CborSerializer).to.be.undefined;
        });
    });

    describe('Browser submodule', function () {
        before(async function () { await import('../src/wampy-single-4-browser.js'); });

        it('should contain Wampy property in the global window object', function () {
            expect(globalThis.Wampy).to.be.a('function');
        });
    });

    describe('Serializers4browser submodule', function () {
        before(async function () { await import('../src/wampy-all-4-browser.js'); });

        it('should contain MsgpackSerializer property in the global window object', function () {
            expect(globalThis.MsgpackSerializer).to.be.a('function');
        });

        it('should contain CborSerializer property in the global window object', function () {
            expect(globalThis.CborSerializer).to.be.a('function');
        });
    });
});
