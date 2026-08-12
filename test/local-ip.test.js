const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { address } = require('../app/lib/local-ip');

describe('local-ip.address', () => {
    it('returns a non-empty IPv4-looking string', () => {
        const ip = address();
        assert.equal(typeof ip, 'string');
        assert.ok(ip.length > 0);
        // Either a real interface or the documented loopback fallback
        assert.match(ip, /^\d{1,3}(\.\d{1,3}){3}$/);
    });
});
