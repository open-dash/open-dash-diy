const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
const hbs = require('handlebars');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');
const domain = require('../lib/dashboard-domain');

module.exports.set = function(app) {

    app.get('/device/:dashId/:id', (request, response) => {
        getTile(request.params.dashId, request.params.id, function(err, result) {
            // Missing dashboard or device: there is no tile to render.
            if (!result) {
                return response.status(404).send('Device not found');
            }

            /*if (result.template) {
                template = "devices/" + result.template.toLowerCase();
            }*/
            var t = "0";

            for (i = 0; i < templates.templates.length; i++) {
                if (templates.templates[i].id.toLowerCase() == result.template) {
                    t = i;
                }
            }

            var template = Buffer.from(templates.templates[t].content, 'base64').toString();
            var compiled = hbs.compile(template);
            var html = compiled({ device: result });

            response.send(html);

            /*
            response.render(template, {
                layout: false,
                version: config.settings.version,
                device: result
            });*/
        });
    });
};

var getTile = function(dashId, id, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, dashId);
    if (!dashboard) {
        return callback(null, null);
    }
    var device = domain.findDashDevice(dashboard, id);
    callback(null, device);
};
