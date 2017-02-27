const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
const dashboards = require('../../data/dashboards.json');
var devices = new SelfReloadJSON(appRoot + '/data/devices.json');
var updates = new SelfReloadJSON(appRoot + '/data/updates.json');

module.exports.set = function(app) {
    app.get('/updates', function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        getUpdates(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                updates.updates = result;
                updates.save();
                res.send(result);
            }
        });
    });

    setInterval(function() {
        getUpdates(function(err, result) {
            if (err) {
                console.log('something went wrong');
            } else {
                updates.updates = result;
                updates.save();
            }
        });
    }, 5000);

    var getUpdates = function(callback) {
        var endpoint = "/updates";
        var token = config.settings.token;
        var url = config.settings.apiUrl + endpoint + '?access_token=' + token;
        //console.log("getting updates from " + url);

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
};