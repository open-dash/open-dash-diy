const express = require('express');
const request = require('request');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var templates = new SelfReloadJSON(appRoot + '/data/templates.json');

module.exports.set = function(app) {

    app.get('/templates', (request, response) => {
        var temps = []
        templates.templates.forEach(temp => {
            temps.push({ id: temp.id, content: Buffer.from(temp.content, 'base64').toString() })
        });
        response.render('templates', {
            version: config.settings.version,
            templates: temps
        });
    });

};