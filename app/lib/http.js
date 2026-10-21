/**
 * Request-compatible HTTP helper with connection-time destination checks.
 * Supports the callback patterns used by this app:
 *   httpRequest({ url, json, method, headers }, cb)
 *   httpRequest.get(url, cb)
 *   httpRequest.post({ url, headers, json }, cb)
 *   httpRequest.defaults({ encoding: null }).get(url, cb)
 */

const dns = require('dns');
const net = require('net');
const http = require('node:http');
const https = require('node:https');
const zlib = require('node:zlib');
const agents = {
    'http:': new http.Agent({ keepAlive: false, proxyEnv: {} }),
    'https:': new https.Agent({ keepAlive: false, proxyEnv: {} })
};
const maximumBodyBytes = 10 * 1024 * 1024;

function buildOptions(input) {
    if (typeof input === 'string') {
        return { url: input };
    }
    return Object.assign({}, input || {});
}

function isPrivateAddress(ip) {
    const type = net.isIP(ip);
    if (type === 4) {
        const parts = ip.split('.').map(Number);
        return parts[0] === 10 ||
            parts[0] === 127 ||
            (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
            (parts[0] === 169 && parts[1] === 254) ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
            (parts[0] === 192 && parts[1] === 0 && [0, 2].includes(parts[2])) ||
            (parts[0] === 192 && parts[1] === 88 && parts[2] === 99) ||
            (parts[0] === 192 && parts[1] === 168) ||
            (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19)) ||
            (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) ||
            (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) ||
            parts[0] === 0 || parts[0] >= 224;
    }
    if (type === 6) {
        // Restrict to ordinary global unicast. This also rejects mapped IPv4,
        // NAT64, link/site-local, ULA, multicast and unspecified addresses.
        const words = ip.split(':').map(word => parseInt(word || '0', 16));
        const first = words[0], second = words[1];
        return first < 0x2000 || first > 0x3fff || first === 0x2002 ||
            (first === 0x3fff && second <= 0xfff) ||
            (first === 0x2001 && (second <= 0x1ff || second === 0xdb8));
    }
    return true;
}

function assertPublicUrl(input) {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('httpRequest: only HTTP(S) URLs without embedded credentials are allowed');
    }
    // Local cameras require an exact operator-configured origin, never a flag
    // accepted from a request body. Re-check this policy on every redirect.
    const allowed = (process.env.OPEN_DASH_HTTP_ALLOWED_ORIGINS || '').split(',').some(value => {
        try {
            const configured = new URL(value.trim());
            return configured.pathname === '/' && !configured.search && !configured.hash &&
                !configured.username && !configured.password && configured.origin === url.origin;
        }
        catch (_) { return false; }
    });
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    if (!allowed && (hostname.toLowerCase() === 'localhost' ||
        (net.isIP(hostname) && isPrivateAddress(hostname)))) {
        throw new Error('httpRequest: refusing to request internal/private address');
    }
    return { url, allowed };
}

function checkedLookup(allowed) {
    return (hostname, options, callback) => {
        dns.lookup(hostname, { all: true, verbatim: true, family: options.family || 0 }, (error, results) => {
            if (error) return callback(error);
            if (!results.length || (!allowed && results.some(result => isPrivateAddress(result.address)))) {
                return callback(new Error('httpRequest: refusing to request internal/private address'));
            }
            // The validated addresses are returned directly to the socket's
            // lookup hook. There is no second, unchecked DNS resolution.
            if (options.all) return callback(null, results);
            return callback(null, results[0].address, results[0].family);
        });
    };
}

function checkedResponse(input, options, redirects = 0, deadline = Date.now() + 30000) {
    return new Promise((resolve, reject) => {
        const { url, allowed } = assertPublicUrl(input);
        if (redirects > 5) throw new Error('httpRequest: too many redirects');
        const remaining = deadline - Date.now();
        if (remaining <= 0) throw new Error('httpRequest: request timed out');
        const transport = url.protocol === 'https:' ? https : http;
        let timer;
        const request = transport.request(url, { ...options, agent: agents[url.protocol],
            lookup: checkedLookup(allowed) }, response => {
            const location = response.headers.location;
            if ([301, 302, 303, 307, 308].includes(response.statusCode) && location) {
                response.destroy();
                const next = new URL(location, url);
                const headers = { ...options.headers };
                if (next.origin !== url.origin) {
                    for (const name of Object.keys(headers)) {
                        if (['authorization', 'cookie', 'proxy-authorization', 'host'].includes(name.toLowerCase())) delete headers[name];
                    }
                }
                const changeToGet = response.statusCode === 303 && options.method !== 'HEAD' ||
                    [301, 302].includes(response.statusCode) && options.method === 'POST';
                if (changeToGet) {
                    for (const name of Object.keys(headers)) {
                        if (['content-length', 'content-type'].includes(name.toLowerCase())) delete headers[name];
                    }
                }
                clearTimeout(timer);
                checkedResponse(next, { ...options, headers, method: changeToGet ? 'GET' : options.method,
                    body: changeToGet ? undefined : options.body }, redirects + 1, deadline).then(resolve, reject);
                return;
            }
            const chunks = [];
            let size = 0;
            response.on('data', chunk => {
                size += chunk.length;
                if (size > maximumBodyBytes) request.destroy(new Error('httpRequest: response too large'));
                else chunks.push(chunk);
            });
            response.on('error', error => { clearTimeout(timer); reject(error); });
            response.on('aborted', () => { clearTimeout(timer); reject(new Error('httpRequest: response aborted')); });
            response.on('end', () => {
                clearTimeout(timer);
                try {
                    let body = Buffer.concat(chunks);
                    const encoding = response.headers['content-encoding'];
                    const decode = { gzip: zlib.gunzipSync, deflate: zlib.inflateSync, br: zlib.brotliDecompressSync }[encoding];
                    if (decode) body = decode(body, { maxOutputLength: maximumBodyBytes });
                    resolve({ statusCode: response.statusCode, headers: response.headers, body });
                } catch (error) { reject(error); }
            });
        });
        timer = setTimeout(() => request.destroy(new Error('httpRequest: request timed out')), remaining);
        request.on('error', error => { clearTimeout(timer); reject(error); });
        if (options.body != null) request.write(options.body);
        request.end();
    });
}

function httpRequest(input, callback) {
    const options = buildOptions(input);
    const url = options.url || options.uri;
    if (!url) {
        const err = new Error('httpRequest: url/uri is required');
        if (typeof callback === 'function') {
            return callback(err);
        }
        throw err;
    }

    const method = (options.method || 'GET').toUpperCase();
    const headers = Object.assign({}, options.headers || {});
    const fetchOpts = { method, headers };

    if (options.body != null) {
        fetchOpts.body = options.body;
    } else if (options.form) {
        const params = new URLSearchParams(options.form);
        fetchOpts.body = params.toString();
        if (!headers['Content-Type'] && !headers['content-type']) {
            headers['content-type'] = 'application/x-www-form-urlencoded';
            fetchOpts.headers = headers;
        }
    } else if (options.json && options.json !== true && method !== 'GET' && method !== 'HEAD') {
        fetchOpts.body = JSON.stringify(options.json);
        if (!headers['Content-Type'] && !headers['content-type']) {
            headers['content-type'] = 'application/json';
            fetchOpts.headers = headers;
        }
    }

    return checkedResponse(url, fetchOpts)
        .then((res) => {
            const response = {
                statusCode: res.statusCode,
                headers: res.headers
            };

            let body;
            if (options.encoding === null) {
                body = res.body;
            } else if (options.json === true) {
                const text = res.body.toString('utf8');
                try {
                    body = text ? JSON.parse(text) : null;
                } catch (parseErr) {
                    body = text;
                }
            } else {
                body = res.body.toString('utf8');
            }

            if (typeof callback === 'function') {
                callback(null, response, body);
            }
            return body;
        }, (err) => {
            if (typeof callback === 'function') {
                callback(err);
                return;
            }
            throw err;
        });
}

httpRequest.get = function get(urlOrOptions, callback) {
    const options = buildOptions(urlOrOptions);
    options.method = 'GET';
    return httpRequest(options, callback);
};

httpRequest.post = function post(urlOrOptions, callback) {
    const options = buildOptions(urlOrOptions);
    options.method = 'POST';
    return httpRequest(options, callback);
};

httpRequest.defaults = function defaults(defaultOptions) {
    const base = Object.assign({}, defaultOptions || {});

    function wrapped(input, callback) {
        const options = Object.assign({}, base, buildOptions(input));
        return httpRequest(options, callback);
    }

    wrapped.get = function get(urlOrOptions, callback) {
        const options = Object.assign({}, base, buildOptions(urlOrOptions), { method: 'GET' });
        return httpRequest(options, callback);
    };

    wrapped.post = function post(urlOrOptions, callback) {
        const options = Object.assign({}, base, buildOptions(urlOrOptions), { method: 'POST' });
        return httpRequest(options, callback);
    };

    wrapped.defaults = function nestedDefaults(more) {
        return httpRequest.defaults(Object.assign({}, base, more || {}));
    };

    return wrapped;
};

module.exports = httpRequest;
