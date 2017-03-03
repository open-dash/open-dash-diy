const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
var SelfReloadJSON = require('self-reload-json');
const bodyParser = require('body-parser');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

module.exports.set = function(app) {

    app.get('/cameras', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('cameras', {
            version: config.settings.version,
            cameras: cameras.cameras,
            css: css
        });
    });
}