const express = require('express');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');

function buildStyleList() {
    var style = [];
    style.push({ "name": "global", "css": Buffer.from(styles.styles.global, 'base64').toString() });
    styles.styles.dashboards.forEach(temp => {
        style.push({ name: temp.name, css: Buffer.from(temp.css, 'base64').toString() });
    });
    return style;
}

module.exports.set = function(app) {

    app.get('/styles', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('styles', {
            version: config.settings.version,
            styles: buildStyleList(),
            css: css
        });
    });

    app.get('/styles/:id', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('styles', {
            version: config.settings.version,
            styles: buildStyleList(),
            css: css,
            id: request.params.id
        });
    });
};