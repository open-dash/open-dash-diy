const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var devices = new SelfReloadJSON(appRoot + '/data/devices.json');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');

module.exports.set = function(app) {

    app.get('/device/:dashId/:id', (request, response) => {
        getTile(request.params.dashId, request.params.id, function(err, result) {
            var template = "devices/default";

            if (result.template) {
                template = "devices/" + result.template.toLowerCase();
            }
            response.render(template, {
                layout: false,
                version: config.settings.version,
                device: result
            });
        });

    });
};

var getTile = function(dashId, id, callback) {
    var dashboard = {};
    dashboards.dashboards.forEach((dash) => { dashboard = (dash.id == dashId) ? dash : null });
    var device = null;
    dashboard.devices.forEach((dev) => {
        if (dev.id == id) {
            device = dev;
        };
    });
    //var type = device.type;
    callback(null, device)
};