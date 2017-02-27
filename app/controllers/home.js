const express = require('express');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
const dashboards = require('../../data/dashboards.json');

module.exports.set = function(app) {

    app.get('/', (request, response) => {
        response.render('home', {
            version: config.settings.version,
            dashboards: dashboards.dashboards
        });
    });
}