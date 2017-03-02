const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');

module.exports.set = function(app) {

    app.get('/styles', (request, response) => {
        var style = []
        style.push({ "name": "global", "css": Buffer.from(styles.styles.global, 'base64').toString() });
        styles.styles.dashboards.forEach(temp => {
            style.push({ name: temp.name, css: Buffer.from(temp.css, 'base64').toString() })
        });
        var css = Buffer.from(styles.styles.global, 'base64').toString();
        response.render('styles', {
            styles: style,
            css: css
        });
    });

};