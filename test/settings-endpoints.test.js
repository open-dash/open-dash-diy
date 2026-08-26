const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Regression: /settings/endpoints handler in app/controllers/settings.js
// previously used the identifier `token` without declaring it locally or
// reading it from config.settings.  In strict-mode / modern Node this is a
// ReferenceError that crashes the request handler (500 to the client).
//
// The fix introduces `var token = config.settings.token;` inside the handler
// before the first use.  These tests verify the source no longer contains a
// bare, undeclared `token` reference in that route handler.

const settingsPath = path.join(__dirname, '..', 'app', 'controllers', 'settings.js');
const source = fs.readFileSync(settingsPath, 'utf8');

describe('/settings/endpoints token variable (regression)', () => {
    it('declares token from config.settings.token inside the handler', () => {
        // The handler body should contain a local assignment from config.settings
        const handlerMatch = source.match(
            /app\.get\('\/settings\/endpoints'[\s\S]*?\n    \}\);/
        );
        assert.ok(handlerMatch, 'settings/endpoints route handler should exist');
        const handlerBody = handlerMatch[0];
        assert.match(handlerBody, /var\s+token\s*=\s*config\.settings\.token/);
    });

    it('does not reference a bare undeclared token before assignment', () => {
        const handlerMatch = source.match(
            /app\.get\('\/settings\/endpoints'[\s\S]*?\n    \}\);/
        );
        const handlerBody = handlerMatch[0];
        // Find the first use of "token" — it must come after the var declaration
        const firstUseIdx = handlerBody.search(/\btoken\b/);
        const declIdx = handlerBody.search(/var\s+token/);
        assert.ok(declIdx !== -1, 'token should be declared with var');
        assert.ok(
            firstUseIdx === declIdx || firstUseIdx > declIdx,
            'first occurrence of token must be its declaration'
        );
    });
});
