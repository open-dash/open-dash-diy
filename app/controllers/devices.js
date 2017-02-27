const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var devices = new SelfReloadJSON(appRoot + '/data/devices.json');

module.exports.set = function(app) {

    app.get('/devices', (request, response) => {
        response.render('devices', {
            version: config.settings.version,
            devices: devices.devices
        });
    });

};