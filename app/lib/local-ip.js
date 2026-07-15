/**
 * Local IPv4 address helper (replacement for the unmaintained `ip` package).
 */
const os = require('os');

function address() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            const family = net.family === 'IPv4' || net.family === 4;
            if (family && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

module.exports = { address };
