const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.post('/api/settings/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveSettings(request.body, function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

};

var saveSettings = function(data, callback) {
    // var update = settings.settings;
    // update.token = data.token;
    // update.apiUrl = data.apiUrl;
    // update.clientId = data.clientId;
    // update.clientSecret = data.clientSecret;
    data.version = config.settings.version;
    config.settings = data;
    config.save();
    callback(null, "{ success }");
};