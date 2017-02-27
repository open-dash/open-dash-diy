const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var settings = new SelfReloadJSON(appRoot + '/data/settings.json');
var cameras = new SelfReloadJSON(appRoot + '/data/cameras.json');

module.exports.set = function(app) {

    app.get('/api/camera/:id', (request, response) => {
        getImage(request.params.id, function(err, result) {
            //response.send('<img src="' + result + '" >');
            response.setHeader('Content-Type', 'image/jpeg');
            response.end(result, 'binary');
        });

    });
};

var getImage = function(id, callback) {
    var request2 = require('request').defaults({ encoding: null });
    var camera = {};
    cameras.cameras.forEach((cam) => { camera = cam; });

    request2.get(camera.url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            data = "data:image/jpeg;base64," + new Buffer(body).toString('base64');
            //console.log(data);
            callback(null, body);
        }
    });
};