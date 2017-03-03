const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.get('/api/templates/:id', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        getTemplate(request.params.id, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });

    app.delete('/api/templates/:id', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        deleteTemplate(request.params.id, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });

    app.post('/api/templates/:id/save', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        saveTemplate(request.params.id, request.body, function(err, result) {
            if (err) {
                response.status(500).send({ error: err });
            } else {
                response.send(result);
            }
        });
    });
}

var getTemplate = function(tempid, callback) {
    var template = {};
    template.css = Buffer.from(templates.templates[tempid].content, 'base64').toString();
    template.name = templates.templates[tempid].id;
    callback(null, template)
}

var saveTemplate = function(id, body, callback) {
    var template = new Buffer(body.content).toString("base64");
    if (templates.templates[id]) {
        templates.templates[id].content = template;
        templates.templates[id].id = body.name;
    } else {
        var t = {};
        t.id = body.name;
        t.content = template
        templates.templates.push(t);
    }
    templates.save();
    callback(null, "success")
}

var deleteTemplate = function(id, callback) {
    templates.templates.splice([id], 1);
    templates.save();
    callback(null, "success");
};