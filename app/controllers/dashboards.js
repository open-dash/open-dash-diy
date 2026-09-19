var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');
const domain = require('../lib/dashboard-domain');

module.exports.set = function(app) {

    app.get('/dashboards', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('dashboards', {
            version: config.settings.version,
            dashboards: dashboards.dashboards,
            css: css
        });
    });


    app.get('/dashboards/:id', (request, response) => {
        var dashboard = domain.findDashboard(dashboards.dashboards, request.params.id) || {};
        var globalcss = Buffer.from(styles.styles.global, 'base64').toString();
        var css = "";
        for (var s in styles.styles.dashboards) {
            if (dashboard.css) {
                if (s == dashboard.css.toString()) {
                    css = Buffer.from(styles.styles.dashboards[s].css, 'base64').toString();
                }
            }
        }
        response.render('dashboard', {
            version: config.settings.version,
            dashboard: dashboard,
            dashcss: css,
            css: globalcss
        });
    });

    app.get('/dashboards/:id/edit', (request, response) => {
        //Build list of devices here...
        var sortedDevices = []
        smartthings.devices.forEach(d => {
            d.api = "smartthings";
            sortedDevices.push(d);
        });
        if (smartthings.routines) {
            smartthings.routines.forEach(r => {
                r.api = "smartthings";
                r.name = r.label;
                r.commands = [{ command: "toggle" }];
                r.type = "Routine";
                sortedDevices.push(r);
            })
        }
        sortedDevices = sortedDevices.sort(sortByType);
        var dashboard = domain.findDashboard(dashboards.dashboards, request.params.id) || {};
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

    app.get('/dashboards/:id/device/:dashDevId', (request, response) => {
        var dashboard = domain.findDashboard(dashboards.dashboards, request.params.id) || {};
        var device = domain.findDashDevice(dashboard, request.params.dashDevId) || {};

        //get device templates
        var temps = templates.templates.map(e => e.id.toLowerCase());

        //console.log(sortedDevices);
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('dashboard-device', {
            version: config.settings.version,
            dashboard: dashboard,
            device: device,
            templates: temps,
            css: css
        });
    });

    app.post('/dashboards/:id/device/:dashDevId/save', (request, response) => {
        var deviceData = request.body;
        var dashboard = domain.findDashboard(dashboards.dashboards, request.params.id);
        if (dashboard) {
            var device = domain.findDashDevice(dashboard, deviceData.dashDevId);
            if (device) {
                device.name = deviceData.name;
                device.enabled = deviceData.enabled;
                device.order = deviceData.order;
                device.url = deviceData.url;
                device.template = deviceData.template;
                dashboards.save();
                response.json({ success: true });
            } else {
                response.status(404).json({ success: false, message: 'Device not found' });
            }
        } else {
            response.status(404).json({ success: false, message: 'Dashboard not found' });
        }
    });

    function sortByType(x, y) {
        return ((x.type == y.type) ? 0 : ((x.type > y.type) ? 1 : -1));
    }

    function sortByOrder(x, y) {
        return ((parseInt(x.order) == parseInt(y.order)) ? 0 : ((parseInt(x.order) > parseInt(y.order)) ? 1 : -1));
    }
};