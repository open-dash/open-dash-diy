const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');

module.exports.set = function(app) {

    app.get('/styles', (request, response) => {
        var style = []
        style.push({ "name": "global", "css": Buffer.from(styles.styles.global, 'base64').toString() });
        styles.styles.dashboards.forEach(temp => {
            style.push({ name: temp.name, css: Buffer.from(temp.css, 'base64').toString() })
        });
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('styles', {
            version: config.settings.version,
            styles: style,
            css: css
        });
    });

    app.get('/styles/:id', (request, response) => {
        var style = []
        style.push({ "name": "global", "css": Buffer.from(styles.styles.global, 'base64').toString() });
        styles.styles.dashboards.forEach(temp => {
            style.push({ name: temp.name, css: Buffer.from(temp.css, 'base64').toString() })
        });
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('styles', {
            version: config.settings.version,
            styles: style,
            css: css,
            id: request.params.id
        });
    });
};