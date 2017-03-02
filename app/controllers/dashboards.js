const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
var SelfReloadJSON = require('self-reload-json');
const fs = require('fs');
const bodyParser = require('body-parser');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');

module.exports.set = function(app) {

    app.get('/dashboards', (request, response) => {
        response.render('dashboards', {
            version: config.settings.version,
            dashboards: dashboards.dashboards
        });
    });


    app.get('/dashboards/:id', (request, response) => {
        var dashboard = {};
        dashboards.dashboards.forEach((dash) => { dashboard = (dash.id == request.params.id) ? dash : null });
        var css = "";
        if (dashboard.css && dashboard.css != "none") {
            var css = Buffer.from(styles.styles.dashboards[dashboard.css].css, 'base64').toString();
        }
        response.render('dashboard', {
            version: config.settings.version,
            dashboard: dashboard,
            css: css
        });
    });

    app.get('/dashboards/:id/edit', (request, response) => {
        var sortedDevices = smartthings.devices.sort(sortByType);
        var dashboard = {};
        dashboards.dashboards.forEach((dash) => {
            if (dash.id == request.params.id) {
                dashboard = dash;
            }
        });
        var sortedDashDevices = dashboard.devices.sort(sortByOrder);
        var style = []
        styles.styles.dashboards.forEach(temp => {
            style.push({ name: temp.name, css: Buffer.from(temp.css, 'base64').toString() })
        });
        response.render('dashboard-edit', {
            version: config.settings.version,
            dashboard: dashboard,
            dashDevices: sortedDashDevices,
            devices: sortedDevices,
            cameras: cameras.cameras,
            css: style
        });
    });

    app.get('/dashboards/:id/device/:deviceId', (request, response) => {
        var dashboard = {};
        dashboards.dashboards.forEach((dash) => { dashboard = (dash.id == request.params.id) ? dash : null });

        var device = {};
        dashboard.devices.forEach((dev) => {
            if (dev.id == request.params.deviceId) {
                device = dev
            }
        });

        //get device templates
        var temps = templates.templates.map(e => e.id);

        //console.log(sortedDevices);
        response.render('dashboard-device', {
            version: config.settings.version,
            dashboard: dashboard,
            device: device,
            templates: temps
        });
    });

    function sortByType(x, y) {
        return ((x.type == y.type) ? 0 : ((x.type > y.type) ? 1 : -1));
    }

    function sortByOrder(x, y) {
        return ((x.order == y.order) ? 0 : ((x.order > y.order) ? 1 : -1));
    }
};