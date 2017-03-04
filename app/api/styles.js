const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.get('/api/styles/:id', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getStyle(request.params.id, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });

    app.delete('/api/styles/:id', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        deleteStyle(request.params.id, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/styles/:id/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveStyle(request.params.id, request.body, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });
}

var getStyle = function(tempid, callback) {
    var style = {};
    if (tempid == "0") {
        style.css = Buffer.from(styles.styles.global, 'base64').toString();
        style.name = "global";
    } else {
        style.css = Buffer.from(styles.styles.dashboards[tempid - 1].css, 'base64').toString();
        style.name = styles.styles.dashboards[tempid - 1].name;
    }
    callback(null, style)
}

var saveStyle = function(id, body, callback) {
    var style = new Buffer(body.content).toString("base64");
    if (id == "0") {
        styles.styles.global = style;
    } else {
        id--;
        if (styles.styles.dashboards[id]) {
            styles.styles.dashboards[id].css = style;
            styles.styles.dashboards[id].name = body.name;
            styles.styles.dashboards[id].id = id; //this may not be right...
        } else {
            var t = {};
            t.id = id;
            t.css = style;
            t.name = body.name
            styles.styles.dashboards.push(t);
        }
    }
    styles.save();
    callback(null, "success")
}

var deleteStyle = function(id, callback) {
    if (id != "global") {
        styles.styles.dashboards.splice([id - 1], 1);
        styles.save();
    }
    callback(null, "success");
};