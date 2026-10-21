const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const dns = require('node:dns');
const net = require('node:net');
const http = require('node:http');
const https = require('node:https');
const httpRequest = require('../app/lib/http');

function transport(t, records = [{ address: '8.8.8.8', family: 4 }], respond = () => ({})) {
    const calls = [], lookups = [], connections = [];
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('unchecked fetch forbidden'); });
    t.mock.method(dns, 'lookup', (host, options, callback) => {
        lookups.push(host);
        callback(null, records);
    });
    function request(url, options, callback) {
        calls.push({ url, options });
        const req = new EventEmitter();
        req.write = body => { calls[calls.length - 1].body = body; };
        req.destroy = error => { if (error) req.emit('error', error); };
        req.end = () => queueMicrotask(() => {
            function connected(error, addresses) {
                if (error) return req.emit('error', error);
                connections.push(addresses);
                const result = respond(url, options, calls.length);
                const response = new PassThrough();
                response.statusCode = result.status || 200;
                response.headers = result.headers || {};
                callback(response);
                response.end(result.body || 'ok');
            }
            const literal = url.hostname.replace(/^\[|\]$/g, '');
            if (net.isIP(literal)) connected(null, [{ address: literal, family: net.isIP(literal) }]);
            else options.lookup(literal, { all: true, family: 0 }, connected);
        });
        return req;
    }
    t.mock.method(http, 'request', request);
    t.mock.method(https, 'request', request);
    const previous = process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS;
    delete process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS;
    t.after(() => {
        if (previous === undefined) delete process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS;
        else process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS = previous;
    });
    return { calls, lookups, connections };
}

function perform(invoke) {
    return new Promise(resolve => invoke((error, response, body) => resolve({ error, response, body })));
}

test('all callback entry points check destinations before opening a connection', async t => {
    const observed = transport(t);
    const internal = ['http://127.0.0.1/', 'http://2130706433/', 'http://0x7f000001/',
        'http://0177.0.0.1/', 'http://10.0.0.1/', 'http://169.254.169.254/',
        'http://100.64.0.1/', 'http://192.0.2.1/', 'http://198.18.0.1/',
        'http://224.0.0.1/', 'http://[::1]/', 'http://[::ffff:127.0.0.1]/',
        'http://[fd00::1]/', 'http://[fe80::1]/', 'http://[2002:7f00:1::]/',
        'http://[2001:db8::1]/', 'file:///etc/passwd', 'https://user:password@example.com/'];
    for (const url of internal) {
        for (const invoke of [cb => httpRequest({ uri: url, allowPrivate: true }, cb),
            cb => httpRequest.get(url, cb), cb => httpRequest.post(url, cb),
            cb => httpRequest.defaults({ encoding: null }).get(url, cb)]) {
            const result = await perform(invoke);
            assert.ok(result.error, url);
        }
    }
    assert.equal(observed.connections.length, 0);
    assert.equal(observed.calls.length, 0);
});

test('public hostname resolves once at the actual socket boundary', async t => {
    const observed = transport(t);
    const result = await perform(cb => httpRequest.get('https://public.example/path', cb));
    assert.ifError(result.error);
    assert.equal(result.body, 'ok');
    assert.deepEqual(observed.lookups, ['public.example']);
    assert.deepEqual(observed.connections[0], [{ address: '8.8.8.8', family: 4 }]);
    assert.equal(observed.calls[0].url.hostname, 'public.example');
});

test('mixed public and private DNS answers cannot reach a socket', async t => {
    const observed = transport(t, [{ address: '8.8.8.8', family: 4 }, { address: '127.0.0.1', family: 4 }]);
    const result = await perform(cb => httpRequest.get('https://rebinding.example/', cb));
    assert.match(result.error.message, /private address/);
    assert.equal(observed.lookups.length, 1);
    assert.equal(observed.connections.length, 0);
});

test('public redirects cannot reach metadata or other unapproved local origins', async t => {
    const observed = transport(t, undefined, () => ({ status: 302,
        headers: { location: 'http://169.254.169.254/latest/meta-data/' } }));
    const result = await perform(cb => httpRequest.get('https://public.example/', cb));
    assert.match(result.error.message, /private address/);
    assert.equal(observed.calls.length, 1);
});

test('redirects drop credentials across origins and preserve callback and JSON semantics', async t => {
    const observed = transport(t, undefined, (_url, _options, number) => number === 1
        ? { status: 303, headers: { location: 'https://next.example/done' } }
        : { body: '{"saved":true}' });
    const result = await perform(cb => httpRequest.post({ url: 'https://public.example/',
        headers: { Authorization: 'test-token', Cookie: 'test-cookie' }, json: { value: 1 } }, cb));
    assert.ifError(result.error);
    assert.equal(observed.calls[0].body, '{"value":1}');
    assert.equal(observed.calls[1].options.method, 'GET');
    assert.equal(observed.calls[1].options.body, undefined);
    assert.equal(observed.calls[1].options.headers.Authorization, undefined);
    assert.equal(observed.calls[1].options.headers.Cookie, undefined);
    const json = await perform(cb => httpRequest({ url: 'https://public.example/data', json: true }, cb));
    assert.deepEqual(json.body, { saved: true });
});

test('local camera access requires an exact operator origin and retains binary responses', async t => {
    const image = Buffer.from([0, 255, 3]);
    const observed = transport(t, undefined, () => ({ body: image }));
    process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS = 'http://127.0.0.1:8080';
    const result = await perform(cb => httpRequest.defaults({ encoding: null }).get('http://127.0.0.1:8080/image', cb));
    assert.ifError(result.error);
    assert.deepEqual(result.body, image);
    const denied = await perform(cb => httpRequest.get('http://127.0.0.1:8081/image', cb));
    assert.ok(denied.error);
    assert.equal(observed.calls.length, 1);
});

test('real sockets follow allowed redirects, decode gzip, and reject metadata redirects', async t => {
    const { once } = require('node:events');
    const zlib = require('node:zlib');
    const previous = process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS;
    const paths = [];
    const server = http.createServer((request, response) => {
        paths.push(request.url);
        if (request.url === '/redirect') {
            response.writeHead(302, { location: '/data' }); response.end();
        } else if (request.url === '/metadata') {
            response.writeHead(302, { location: 'http://169.254.169.254/latest/meta-data/' }); response.end();
        } else {
            response.writeHead(200, { 'content-type': 'application/json', 'content-encoding': 'gzip' });
            response.end(zlib.gzipSync('{"ok":true}'));
        }
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(async () => {
        if (previous === undefined) delete process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS;
        else process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS = previous;
        await new Promise(resolve => server.close(resolve));
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS = origin;
    const result = await perform(cb => httpRequest({ url: origin + '/redirect', json: true }, cb));
    assert.ifError(result.error);
    assert.deepEqual(result.body, { ok: true });
    const refused = await perform(cb => httpRequest.get(origin + '/metadata', cb));
    assert.match(refused.error.message, /private address/);
    assert.deepEqual(paths, ['/redirect', '/data', '/metadata']);
});

test('camera route completes blocked requests and selects only the requested camera', async t => {
    const { readFileSync } = require('node:fs');
    const vm = require('node:vm');
    const observed = transport(t);
    const module = { exports: {} };
    vm.runInNewContext(readFileSync(require.resolve('../app/api/cameras'), 'utf8'), {
        module, require(name) {
            if (name === '../lib/http') return httpRequest;
            if (name === 'app-root-path') return '/task';
            if (name === 'self-reload-json') return class {
                constructor() { this.cameras = [{ id: 'camera-1', url: 'http://127.0.0.1/private' }]; }
            };
            throw new Error('Unexpected dependency: ' + name);
        }
    });
    let route;
    module.exports.set({ get(path, handler) { assert.equal(path, '/api/camera/:id'); route = handler; } });
    const invoke = id => new Promise(resolve => {
        const response = { code: 200, status(code) { this.code = code; return this; },
            json(body) { resolve({ code: this.code, body }); }, setHeader() {},
            end() { assert.fail('Blocked camera must not return an image'); } };
        route({ params: { id } }, response);
    });
    assert.equal((await invoke('camera-1')).code, 502);
    assert.equal((await invoke('not-configured')).code, 404);
    assert.equal(observed.calls.length, 0);
});
