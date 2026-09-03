const express = require('express');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

function buildTemplateList() {
    var temps = [];
    templates.templates.forEach(temp => {
        temps.push({ id: temp.id, content: Buffer.from(temp.content, 'base64').toString() });
    });
    return temps;
}

module.exports.set = function(app) {

    app.get('/templates', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('templates', {
            version: config.settings.version,
            templates: buildTemplateList(),
            css: css
        });
    });

    app.get('/templates/:id', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('templates', {
            version: config.settings.version,
            templates: buildTemplateList(),
            css: css,
            id: request.params.id
        });
    });
};