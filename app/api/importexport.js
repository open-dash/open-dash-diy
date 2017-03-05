const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
var multer = require('multer')
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })
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

        var exportStyles = [];
        request.body.styles.forEach((id) => {

            getStyle(id, function(err, result) {
                exportStyles.push(result);
            });
        });

        var exportTemplates = [];
        request.body.templates.forEach((id) => {

            getTemplate(id, function(err, result) {
                exportTemplates.push(result);
            });
        });
        var fullExport = {};
        fullExport.styles = exportStyles;
        fullExport.templates = exportTemplates;

        response.send(JSON.stringify(fullExport));
    });

    app.post('/importexport/upload', upload.single('upload-file'), (request, response, next) => {
        var importJson = request.file.buffer.toString();
        var toImport = JSON.parse(importJson.slice(1));
        console.log(toImport);

        for (var i in toImport.styles) {
            if (toImport.styles[i].name.toLowerCase() == "global") {
                styles.styles.global = toImport.styles[i].css;
            } else {
                var match = false;
                for (var x in styles.styles.dashboards) {
                    if (toImport.styles[i].name.toLowerCase() == styles.styles.dashboards[x].name.toLowerCase()) {
                        styles.styles.dashboards[x].name = toImport.styles[i].name
                        styles.styles.dashboards[x].css = toImport.styles[i].css
                        match = true;
                    }
                }
                if (!match) {
                    var t = {};
                    t.id = styles.styles.dashboards.length;
                    t.css = toImport.styles[i].css;
                    t.name = toImport.styles[i].name
                    styles.styles.dashboards.push(t);
                }
            }
        }
        styles.save()
        for (var i in toImport.templates) {
            var match = false;
            for (var x in templates.templates) {
                if (toImport.templates[i].name.toLowerCase() == templates.templates[x].id.toLowerCase()) {
                    templates.templates[x].id = toImport.templates[i].name
                    templates.templates[x].content = toImport.templates[i].content
                    match = true;
                }
            }
            if (!match) {
                var t = {};
                t.id = toImport.templates[i].name;
                t.content = toImport.templates[i].content
                templates.templates.push(t);
            }
        }
        templates.save()
        response.send("Imported");
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
            template.content = templates.templates[i].content;
        }
    }
    callback(null, template)
}