const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createDashboardAuth, sameOriginWrites } = require('../app/lib/dashboard-auth');

const password = 'synthetic-test-password';
const authorized = 'Basic ' + Buffer.from('dashboard:' + password).toString('base64');
function request(middleware, headers = {}, method = 'GET') {
    let continued = false;
    const response = {
        code: 200, headers: {}, body: null,
        status(code) { this.code = code; return this; },
        setHeader(name, value) { this.headers[name] = value; },
        json(value) { this.body = value; return this; }
    };
    middleware({ headers, method }, response, () => { continued = true; });
    return { response, continued };
}

test('auth fails closed without a dashboard password even with an upstream token', () => {
    const result = request(createDashboardAuth({ SMARTTHINGS_TOKEN: 'configured' }), { authorization: authorized });
    assert.equal(result.response.code, 503);
    assert.equal(result.continued, false);
});
test('anonymous, incorrect, malformed, and oversized authorization cannot pass', () => {
    const auth = createDashboardAuth({ OPEN_DASH_PASSWORD: password });
    for (const authorization of [undefined, '', 'Bearer configured', 'Basic invalid', 'Basic ' + 'A'.repeat(5000),
        'Basic ' + Buffer.from('dashboard:wrong').toString('base64')]) {
        const result = request(auth, { authorization });
        assert.equal(result.response.code, 401);
        assert.equal(result.continued, false);
        assert.match(result.response.headers['WWW-Authenticate'], /^Basic /);
        assert.equal(result.response.headers['Cache-Control'], 'no-store');
    }
    assert.equal(request(auth, { authorization: authorized }).continued, true);
});
test('explicit usernames authenticate and credentials are not reflected in errors', () => {
    const auth = createDashboardAuth({ OPEN_DASH_USERNAME: 'owner', OPEN_DASH_PASSWORD: password });
    assert.equal(request(auth, { authorization: authorized }).response.code, 401);
    const header = 'Basic ' + Buffer.from('owner:' + password).toString('base64');
    assert.equal(request(auth, { authorization: header }).continued, true);
    assert.equal(JSON.stringify(request(auth).response).includes(password), false);
});
test('write origins must match the complete host and port', () => {
    for (const origin of [undefined, 'null', 'garbage', 'https://dash.test.evil.example',
        'https://evil.example/dash.test', 'https://dash.test:444', 'https://dash.test@evil.example']) {
        assert.equal(request(sameOriginWrites, { origin, host: 'dash.test' }, 'POST').response.code, 403);
    }
    assert.equal(request(sameOriginWrites, { origin: 'https://dash.test', host: 'dash.test' }, 'POST').continued, true);
    assert.equal(request(sameOriginWrites, { referer: 'http://localhost:3000/settings', host: 'localhost:3000' }, 'PUT').continued, true);
    assert.equal(request(sameOriginWrites).continued, true);
});
test('authentication is installed before every controller, API, and public asset', () => {
    const source = readFileSync(require.resolve('../app/index'), 'utf8');
    const auth = source.indexOf('app.use(createDashboardAuth())');
    assert.ok(auth > 0);
    for (const route of ['controllers.set(app)', 'api.set(app)', 'app.use(express.static']) {
        assert.ok(auth < source.indexOf(route));
    }
});
