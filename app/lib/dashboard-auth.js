'use strict';

const { createHash, timingSafeEqual } = require('node:crypto');

function digest(value) {
    return createHash('sha256').update(value).digest();
}

// The SmartThings token authenticates this server upstream. It says nothing
// about the browser requesting a camera, settings page, or local API.
function createDashboardAuth(env = process.env) {
    const username = env.OPEN_DASH_USERNAME || 'dashboard';
    const password = env.OPEN_DASH_PASSWORD || '';
    const configured = !username.includes(':') && password.length >= 16;
    const expected = digest(Buffer.from(username + ':' + password).toString('base64'));
    return function dashboardAuth(req, res, next) {
        res.setHeader('Cache-Control', 'no-store');
        if (!configured) {
            return res.status(503).json({ error: 'Set OPEN_DASH_PASSWORD to at least 16 characters before starting Open-Dash.' });
        }
        const header = req.headers.authorization;
        const match = typeof header === 'string' && header.length <= 4096
            ? /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header) : null;
        if (!match || !timingSafeEqual(digest(match[1]), expected)) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Open-Dash", charset="UTF-8"');
            return res.status(401).json({ error: 'Authentication required' });
        }
        next();
    };
}

function sameOriginWrites(req, res, next) {
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) return next();
    try {
        const origin = new URL(req.headers.origin || req.headers.referer);
        if (['http:', 'https:'].includes(origin.protocol) &&
            !origin.username && !origin.password && origin.host === req.headers.host) {
            return next();
        }
    } catch (_) {
        // Missing and malformed origins fail closed, including Origin: null.
    }
    return res.status(403).json({ error: 'CSRF check failed' });
}

module.exports = { createDashboardAuth, sameOriginWrites };
