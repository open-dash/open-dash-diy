const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Regression: /api/weather in app/api/weather.js previously only invoked its
// httpRequest callback on the success path:
//
//     if (error) { callback(error) }
//     if (!error && response.statusCode === 200) { callback(null, body); }
//
// For any non-200 HTTP response (e.g. 401/404 from the upstream SmartThings
// gateway) both branches were skipped, so getWeather's outer callback was
// never called and the Express handler never sent a response. The request
// therefore hung indefinitely and the browser's $.ajax (public/js/weather.js)
// reported no error, leaving the weather presenters stale.
//
// The fix collapses the two branches into a single if/else that reports the
// error on every non-success outcome, mirroring app/api/updates.js.

const weatherPath = path.join(__dirname, '..', 'app', 'api', 'weather.js');
const source = fs.readFileSync(weatherPath, 'utf8');

// Pull the body of the innermost httpRequest callback
// ("function(error, response, body) { ... }") via brace matching,
// so the assertions don't depend on exact indentation.
function extractHttpRequestCallbackBody(src) {
    const start = src.indexOf('function(error, response, body)');
    assert.ok(start !== -1, 'httpRequest callback should exist in getWeather');
    let i = src.indexOf('{', start);
    assert.ok(i !== -1, 'callback body should open with {');
    let depth = 0;
    for (; i < src.length; i++) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
            depth--;
            if (depth === 0) {
                return src.slice(src.indexOf('{', start) + 1, i);
            }
        }
    }
    throw new Error('unbalanced braces in httpRequest callback');
}

const cbBody = extractHttpRequestCallbackBody(source);

describe('/api/weather getWeather callback (regression)', () => {
    it('has exactly one success-path callback(null, body) call', () => {
        const successCalls = cbBody.match(/callback\(null,\s*body\)/g) || [];
        assert.equal(
            successCalls.length,
            1,
            'exactly one success-path callback(null, body) call should exist'
        );
    });

    it('routes non-success outcomes through an error branch', () => {
        assert.match(
            cbBody,
            /\}\s*else\s*\{\s*callback\((error|new Error\()/,
            'a non-success outcome must call the outer callback with an error'
        );
    });

    it('guards response before reading statusCode', () => {
        assert.match(
            cbBody,
            /!\s*error\s*&&\s*response\s*&&\s*response\.statusCode\s*===?\s*200/,
            'success check must guard response before reading statusCode'
        );
    });

    it('does not leave a bare "if (error)" guard that can skip the success check', () => {
        // The old shape was:
        //     if (error) { callback(error) }
        //     if (!error && response.statusCode === 200) { callback(null, body); }
        // where a non-200 response fell through both branches. The fixed
        // shape uses a single if/else, so the standalone "if (error)" guard
        // must be gone.
        assert.doesNotMatch(
            cbBody,
            /if\s*\(\s*error\s*\)\s*\{\s*callback\(\s*error\s*\)/,
            'the standalone "if (error) { callback(error) }" guard should be removed'
        );
    });
});
