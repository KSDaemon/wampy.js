import { use } from 'chai';
import chaiBytes from 'chai-bytes';

const expect = use(chaiBytes).expect;

import * as wampyCryptosign from '../src/auth/cryptosign/wampy-cryptosign.js';

const privateKey = '6e1fde9cf9e2359a87420b65a87dc0c66136e66945196ba2475990d8a0c3a25b',
    challenge = 'b05e6b8ad4d69abf74aa3be3c0ee40ae07d66e1895b9ab09285a2f1192d562d2',
    signature = '7beb282184baadd08f166f16dd683b39cab53816ed81e6955def951cb2ddad1ec184e206746fd82bda075af03711d3d5658fc84a76196b0fa8d1ebc92ef9f30bb05e6b8ad4d69abf74aa3be3c0ee40ae07d66e1895b9ab09285a2f1192d562d2';

describe('Wampy-cryptosign plugin', function () {

    it('provides helper for converting hex string to bytes array', function() {
        const str = '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122';
        const expected = new Uint8Array([
            84,  94, 251,  10,  33, 146, 219, 141,
                67, 241,  24, 233, 191, 154, 238,   8,
                20, 102, 225, 239,  54, 199,   8, 185,
                110, 230, 246,  45, 221, 173, 145,  34
            ]);
        expect(wampyCryptosign.hex2bytes(str)).to.be.equalBytes(expected);
    });

    it('provides helper for converting bytes array to hex string', function() {
        const bytes = new Uint8Array([
            84,  94, 251,  10,  33, 146, 219, 141,
            67, 241,  24, 233, 191, 154, 238,   8,
            20, 102, 225, 239,  54, 199,   8, 185,
            110, 230, 246,  45, 221, 173, 145,  34
        ]);
        const expected = '545efb0a2192db8d43f118e9bf9aee081466e1ef36c708b96ee6f62dddad9122';
        expect(wampyCryptosign.bytes2hex(bytes)).to.be.equal(expected);
    });

    it('allows to compute signature for message with private key', function() {
        const onChallenge = wampyCryptosign.sign(privateKey);
        const wampySignature = onChallenge('cryptosign', { challenge });
        expect(wampySignature).to.be.equal(signature);
    });

    it('throws error if auth method is incorrect', function() {
        const onChallenge = wampyCryptosign.sign(privateKey);
        expect(() => onChallenge('not-crypto-sign', { challenge }))
            .to.throw('Unknown authentication method requested!');
    });

    it('throws error if challenge is missed or incorrect', function() {
        const onChallenge = wampyCryptosign.sign(privateKey);
        expect(() => onChallenge('cryptosign', {}))
            .to.throw('No challenge provided!');
        expect(() => onChallenge('cryptosign', { challenge: challenge.slice(0, 11) }))
            .to.throw('Expected challenge to be an even number of characters!');
    });
});
