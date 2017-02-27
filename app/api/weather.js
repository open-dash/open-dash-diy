const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.get('/api/weather', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getWeather(function(err, result) {
            if (err) {
                response.send(500, { error: 'something went wrong' });
            } else {
                response.send(result);
            }
        });
    });

    var getWeather = function(callback) {
        var endpoint = "/weather";
        var token = config.settings.token;
        var url = 'https://graph.api.smartthings.com:443/api/smartapps/installations/7590d7fd-2156-4aa8-a1c2-12202b258e63' + endpoint + '?access_token=' + token;
        //console.log("getting devices from " + url);

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

}