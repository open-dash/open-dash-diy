var home = require('./home');
var devices = require('./devices');
var device = require('./device');
var dashboards = require('./dashboards');
var settings = require('./settings');
var updates = require('./updates');
var cameras = require('./cameras');

module.exports.set = function(app) {
    home.set(app);
    devices.set(app);
    device.set(app);
    dashboards.set(app);
    settings.set(app);
    updates.set(app);
    cameras.set(app);
}