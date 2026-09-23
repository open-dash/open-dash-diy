var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

module.exports.set = function(app) {

    app.get('/cameras', (request, response) => {
        if (!config.settings.token) {
            return response.status(401).redirect('/settings');
        }
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('cameras', {
            version: config.settings.version,
            cameras: cameras.cameras,
            css: css
        });
    });
}