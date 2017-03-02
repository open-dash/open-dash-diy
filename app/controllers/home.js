const express = require('express');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

module.exports.set = function(app) {

    app.get('/', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('home', {
            version: config.settings.version,
            dashboards: dashboards.dashboards,
            css: css
        });
    });
}