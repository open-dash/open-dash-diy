const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');

module.exports.set = function(app) {

    app.get('/smartthings', (request, response) => {
        var devices = smartthings.devices;
        var routines = smartthings.routines;
        var locations = smartthings.locations;
        var modes = smartthings.modes;

        response.render('smartthings', {
            version: config.settings.version,
            devices: devices,
            routines: routines,
            locations: locations,
            modes: modes
        });
    });

};