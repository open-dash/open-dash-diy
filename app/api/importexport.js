const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');

module.exports.set = function(app) {
    app.use(bodyParser.json());

    app.post('/api/importexport/export', (request, response) => {
        response.setHeader('Content-Type', 'application/json');
        var exported = request.body;

        //loop through styles
        var exportStyles = [];
        request.body.styles.forEach((id) => {

            getStyle(id, function(err, result) {
                exportStyles.push(result);
            });
        });

        //loop through templates
        var exportTemplates = [];
        request.body.templates.forEach((id) => {

            getTemplate(id, function(err, result) {
                exportTemplates.push(result);
            });
        });
        var fullExport = {};
        fullExport.styles = exportStyles;
        fullExport.templates = exportTemplates;

        //figure out how to stream back a file.
        // response.setHeader('Content-Type', 'application/text');
        // response.setHeader('content-disposition', 'attachment; filename=export.json');
        // response.send(fullExport);
        // response.end();
        response.send(fullExport);
    });
}

var getStyle = function(tempid, callback) {
    var style = {};
    if (tempid == "global") {
        style.name = "global";
        style.css = styles.styles.global
    } else {
        style.name = styles.styles.dashboards[tempid].name;
        style.css = styles.styles.dashboards[tempid].css;
    }
    callback(null, style)
}

var getTemplate = function(tempid, callback) {
    var template = {};
    for (var i in templates.templates) {
        if (templates.templates[i].id == tempid) {
            template.name = templates.templates[i].id;
            template.css = templates.templates[i].content;
        }
    }
    callback(null, template)
}