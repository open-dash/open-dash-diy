const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.get('/api/smartthings/devices', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getDevices(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/smartthings/routines', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getRoutines(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/smartthings/routines/:id', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        runRoutine(request.params.id, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });
    app.get('/api/smartthings/locations', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getLocations(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/smartthings/modes', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getModes(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/smartthings/devices/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveDevices(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/smartthings/routines/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveRoutines(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/smartthings/locations/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveLocations(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/smartthings/modes/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveModes(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/smartthings/devices/:id/:command/:value', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        sendCommand(request.params.id, request.params.command, request.params.value, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/smartthings/devices/:id/:command/', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        sendCommand(request.params.id, request.params.command, null, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

};

var sendCommand = function(id, cmd, value, callback) {
    var endpoint = "/devices/" + id + "/" + cmd + "";
    if (value) { endpoint += "/" + value }
    //var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + config.settings.token;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var getDevices = function(callback) {
    var endpoint = "/allDevices";
    var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + token;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            body.forEach((d) => {
                for (var x in d.attributes) {
                    d.attributes[x] = d.attributes[x] != null ? d.attributes[x].replace(/\n/g, " ") : d.attributes[x];
                }
            });
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var getRoutines = function(callback) {
    var endpoint = "/routines";
    var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + token;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var runRoutine = function(id, callback) {
    var endpoint = "/routines/" + id;
    var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + token;

    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: url,
        json: true,

    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var getLocations = function(callback) {
    var endpoint = "/locations";
    var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + token;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var getModes = function(callback) {
    var endpoint = "/modes";
    var token = config.settings.token;
    var url = config.settings.apiUrl + endpoint + '?access_token=' + token;

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(error);
        }
    });
};

var saveDevices = function(data, callback) {
    var fs = require('fs');
    smartthings.devices = data;
    smartthings.save();
    callback(null, "{ success }");
};

var saveRoutines = function(data, callback) {
    var fs = require('fs');
    smartthings.routines = data;
    smartthings.save();
    callback(null, "{ success }");
};

var saveLocations = function(data, callback) {
    var fs = require('fs');
    smartthings.locations = data;
    smartthings.save();
    callback(null, "{ success }");
};

var saveModes = function(data, callback) {
    var fs = require('fs');
    smartthings.modes = data;
    smartthings.save();
    callback(null, "{ success }");
};