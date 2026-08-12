const express = require('express');
const bodyParser = require('body-parser');
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
const domain = require('../lib/dashboard-domain');
var dashboards = new SelfReloadJSON(appRoot + '/data/dashboards.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');
var updates = new SelfReloadJSON(appRoot + '/data/updates.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');

module.exports.set = function(app) {

    app.post('/api/dashboard/:id/:cmd', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        if (request.params.cmd == "save") {
            saveDashboard(request.params.id, request.body, function(err, result) {
                if (err) {
                    response.send(500, { error: 'something went wrong' });
                } else {
                    response.send(result);
                }
            });
        } else {
            updateDashboard(request.params.cmd, request.params.id, request.body, function(err, result) {
                if (err) {
                    response.send(500, { error: 'something went wrong' });
                } else {
                    response.send(result);
                }
            });
        };
    });

    app.post('/api/dashboard/add', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        addDashboard(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/dashboard/:dashid/device/:deviceid', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        findDashDevice(request.params.dashid, request.params.deviceid, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/dashboard/:dashid/device/:deviceid/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveDashDevice(request.params.dashid, request.params.deviceid, request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/dashboard/:dashid/devices', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        findDevices(request.params.dashid, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

};

var findDashDevice = function(dashId, deviceId, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, dashId) || {};
    var device = domain.findDashDevice(dashboard, deviceId) || {};
    callback(null, device);
};

var saveDashDevice = function(dashId, deviceId, data, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, dashId) || {};
    var device = domain.findDashDevice(dashboard, deviceId) || {};
    device.name = data.name;
    device.enabled = data.enabled;
    device.template = data.template;
    device.order = data.order;
    dashboards.save();
    callback(null, device);
};

var findDevices = function(dashId, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, dashId) || {};
    callback(null, domain.listEnabledDeviceRefs(dashboard));
};

var updateDashboard = function(cmd, id, data, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, id) || {};
    switch (cmd) {
        case "add":
            if (data.type == "blank") {
                var blankTileId = uuidv1();
                var dashDevice = domain.buildBlankTile(blankTileId);
                dashDevice.dashDevId = uuidv1();
                dashboard.devices.push(dashDevice);
            } else {
                for (var x in data) {
                    var temps = templates.templates.map(e => e.id);
                    if (data[x].type != "Routine") {
                        for (i = 0; smartthings.devices.length > i; i++) {
                            if (smartthings.devices[i].id == data[x].id) {
                                var dashDevice = smartthings.devices[i];
                                dashDevice.template = domain.resolveDeviceTemplate(dashDevice.type, temps);
                                dashDevice.enabled = true;
                                dashDevice.order = "99";
                                dashDevice.dashDevId = uuidv1();
                                dashboard.devices.push(dashDevice);
                            }
                        }
                    } else {
                        for (i = 0; smartthings.routines.length > i; i++) {
                            if (smartthings.routines[i].id == data[x].id) {
                                var dashDevice = smartthings.routines[i];
                                dashDevice.template = "routine";
                                dashDevice.enabled = true
                                dashDevice.order = "99"
                                dashDevice.api = "smartthings";
                                dashDevice.name = smartthings.routines[i].label;
                                dashDevice.commands = [{ command: "toggle" }];
                                dashDevice.type = "Routine";
                                dashDevice.dashDevId = uuidv1();
                                dashboard.devices.push(dashDevice);
                            }
                        }
                    }
                }
            }
            break;

        case "addcamera":

            for (i = 0; cameras.cameras.length > i; i++) {
                if (cameras.cameras[i].id == data[x]) {
                    var dashDevice = cameras.cameras[i];
                    dashDevice.template = "camera";
                    dashDevice.enabled = true;
                    dashDevice.order = "0";
                    dashDevice.path = "/api/camera/" + dashDevice.id;
                    dashDevice.dashDevId = uuidv1();
                    dashboard.devices.push(dashDevice);
                }
            }
            break;
        case "remove":
            domain.removeDevicesByDashDevIds(dashboard, data);
            break;
        default:
            break;
    }
    dashboards.save();

    callback(null, "success");
};

var addDashboard = function(data, callback) {
    var dashboard = domain.createDashboardRecord(data.name, domain.nextDashboardId(dashboards.dashboards));
    dashboards.dashboards.push(dashboard);
    dashboards.save();
    callback(null, "success");
};

var saveDashboard = function(id, body, callback) {
    var dashboard = domain.findDashboard(dashboards.dashboards, id) || {};
    dashboard.name = body.name
    dashboard.css = body.css
    dashboards.save();
    callback(null, "success");
};