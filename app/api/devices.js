const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var deviceList = new SelfReloadJSON(appRoot + '/data/devices.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.get('/api/devices', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getDevices(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/devices/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveDevices(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/devices/:id/:command/:value', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        sendCommand(request.params.id, request.params.command, request.params.value, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    app.get('/api/devices/:id/:command/', (request, response) => {
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
    var url = 'https://graph.api.smartthings.com:443/api/smartapps/installations/7590d7fd-2156-4aa8-a1c2-12202b258e63' + endpoint + '?access_token=' + token;

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

var saveDevices = function(data, callback) {
    var fs = require('fs');
    deviceList.devices = data;
    deviceList.save();
    callback(null, "{ success }");
};