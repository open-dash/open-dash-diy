/**
 * Minimal request-compatible HTTP helper using native fetch.
 * Supports the callback patterns used by this app:
 *   httpRequest({ url, json, method, headers }, cb)
 *   httpRequest.get(url, cb)
 *   httpRequest.post({ url, headers, json }, cb)
 *   httpRequest.defaults({ encoding: null }).get(url, cb)
 */

function buildOptions(input) {
    if (typeof input === 'string') {
        return { url: input };
    }
    return Object.assign({}, input || {});
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

    fetch(url, fetchOpts)
        .then(async (res) => {
            const response = {
                statusCode: res.status,
                headers: Object.fromEntries(res.headers.entries())
            };

            let body;
            if (options.encoding === null) {
                body = Buffer.from(await res.arrayBuffer());
            } else if (options.json === true) {
                const text = await res.text();
                try {
                    body = text ? JSON.parse(text) : null;
                } catch (parseErr) {
                    body = text;
                }
            } else {
                body = await res.text();
            }

            if (typeof callback === 'function') {
                callback(null, response, body);
            }
        })
        .catch((err) => {
            if (typeof callback === 'function') {
                callback(err);
            }
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
