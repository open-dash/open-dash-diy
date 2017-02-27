// index.js
require('./app/');
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');

console.log("Open-Dash Node.js version " + config.settings.version + " is starting.");