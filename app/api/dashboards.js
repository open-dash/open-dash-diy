const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
var uuid = require('uuid');
const fs = require('fs');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
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
    var dashboard = {};
    for (i = 0; dashboards.dashboards.length > i; i++) {
        if (dashboards.dashboards[i].id == dashId) {
            dashboard = dashboards.dashboards[i];
        }
    }
    var device = {};
    for (i = 0; dashboard.devices.length > i; i++) {
        if (dashboard.devices[i].dashDevId == deviceId) {
            device = dashboard.devices[i];
        }
    }
    callback(null, device);
};

var saveDashDevice = function(dashId, deviceId, data, callback) {
    var dashboard = {};
    for (i = 0; dashboards.dashboards.length > i; i++) {
        if (dashboards.dashboards[i].id == dashId) {
            dashboard = dashboards.dashboards[i];
        }
    }
    var device = {};
    for (i = 0; dashboard.devices.length > i; i++) {
        if (dashboard.devices[i].dashDevId == deviceId) {
            device = dashboard.devices[i];
        }
    }
    device.name = data.name;
    device.enabled = data.enabled;
    device.template = data.template;
    device.order = data.order;
    dashboards.save();
    callback(null, device);
};

var findDevices = function(dashId, callback) {
    var dashboard = {};
    for (i = 0; dashboards.dashboards.length > i; i++) {
        if (dashboards.dashboards[i].id == dashId) {
            dashboard = dashboards.dashboards[i];
        }
    }
    var devices = [];
    for (i = 0; dashboard.devices.length > i; i++) {
        if (dashboard.devices[i].enabled) {
            devices.push({
                "id": dashboard.devices[i].dashDevId,
                "order": dashboard.devices[i].order
            })
        };
    }

    callback(null, devices);
};

var updateDashboard = function(cmd, id, data, callback) {
    var dashboard = {};
    for (i = 0; dashboards.dashboards.length > i; i++) {
        if (dashboards.dashboards[i].id == id) {
            dashboard = dashboards.dashboards[i];
        }
    }
    switch (cmd) {
        case "add":
            //var dashIds = dashboard.devices.map(e => e.id);
            if (data.type == "blank") {
                var dashDevice = {};
                dashDevice.name = "Blank Tile";
                dashDevice.type = "Blank"
                dashDevice.id = "Blank_" + uuid.v1();
                dashDevice.template = "Blank";
                dashDevice.enabled = true;
                dashDevice.order = "1";
                dashDevice.dashDevId = uuid.v1();
                dashboard.devices.push(dashDevice);
            } else {
                for (var x in data) {
                    var match = false;
                    //check if already in list, remove if you want duplicate devices
                    //for (var d in dashIds) {
                    //    if (dashIds[d] == data[x].id) { match = true }
                    //}
                    //if (match) {
                    //console.log('already exists');
                    //} else {
                    var device = {};
                    var temps = templates.templates.map(e => e.name);
                    //loop through smartthings devices
                    if (data[x].type != "Routine") {
                        for (i = 0; smartthings.devices.length > i; i++) {
                            if (smartthings.devices[i].id == data[x].id) {
                                var dashDevice = smartthings.devices[i];
                                if (temps.indexOf(dashDevice.type) >= 0) {
                                    dashDevice.template = dashDevice.type
                                } else {
                                    for (var f in temps) {
                                        var xx = temps[f];
                                        if (dashDevice.type.toLowerCase().includes(temps[f].toLowerCase())) {
                                            dashDevice.template = temps[f];
                                        }
                                    }
                                    if (dashDevice.template == null) { dashDevice.template = "default" }
                                }
                                dashDevice.enabled = true;
                                dashDevice.order = "99";
                                dashDevice.dashDevId = uuid.v1();
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
                                dashDevice.dashDevId = uuid.v1();
                                dashboard.devices.push(dashDevice);
                            }
                        }
                    }
                    //}
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
                    dashDevice.dashDevId = uuid.v1();
                    dashboard.devices.push(dashDevice);
                }
            }
            break;
        case "remove":
            var devicesDelete = [];
            for (var deviceId in data) {
                try {
                    for (i = 0; dashboard.devices.length > i; i++) {
                        if (dashboard.devices[i].dashDevId == data[deviceId]) {
                            dashboard.devices.splice([i], 1);
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            break;
        default:
            break;
    }
    dashboards.save();

    //save dashboards
    callback(null, "success");
};

var addDashboard = function(data, callback) {
    var dashboard = {};
    dashboard.id = getId();
    dashboard.name = data.name;
    dashboard.css = "none";
    dashboard.devices = [];
    dashboards.dashboards.push(dashboard);
    dashboards.save();
    callback(null, "success");
};

var saveDashboard = function(id, body, callback) {
    var dashboard = {};
    for (i = 0; dashboards.dashboards.length > i; i++) {
        if (dashboards.dashboards[i].id == id) {
            dashboard = dashboards.dashboards[i];
        }
    }
    dashboard.name = body.name
    dashboard.css = body.css
    dashboards.save();
    callback(null, "success");
};


var getId = function() {
    var id = 0;
    for (var dash in dashboards.dashboards) {
        if (parseInt(dash) <= id) {
            id++;
        }
    }
    return id.toString();
};