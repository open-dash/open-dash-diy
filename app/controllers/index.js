var home = require('./home');
var smartthings = require('./smartthings');
var device = require('./device');
var dashboards = require('./dashboards');
var settings = require('./settings');
var updates = require('./updates');
var cameras = require('./cameras');
var templates = require('./templates');
var styles = require('./styles');
var importexport = require('./importexport');

module.exports.set = function(app) {
    home.set(app);
    smartthings.set(app);
    device.set(app);
    dashboards.set(app);
    settings.set(app);
    updates.set(app);
    cameras.set(app);
    templates.set(app);
    styles.set(app);
    importexport.set(app);
}