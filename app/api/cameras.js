const httpRequest = require('../lib/http');
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');

module.exports.set = function(app) {

    app.get('/api/camera/:id', (request, response) => {
        getImage(request.params.id, function(err, result) {
            if (err) {
                return response.status(err.statusCode || 502).json({ error: 'Camera image unavailable.' });
            }
            response.setHeader('Content-Type', 'image/jpeg');
            response.end(result, 'binary');
        });

    });
};

var getImage = function(id, callback) {
    var binaryRequest = httpRequest.defaults({ encoding: null });
    var camera = cameras.cameras.find(cam => String(cam.id) === String(id));
    if (!camera || !camera.url) {
        return callback(Object.assign(new Error('Camera not configured'), { statusCode: 404 }));
    }

    binaryRequest.get(camera.url, function(error, response, body) {
        if (error || !response || response.statusCode !== 200) {
            return callback(error || new Error('Camera returned an unsuccessful response'));
        }
        callback(null, body);
    });
};
