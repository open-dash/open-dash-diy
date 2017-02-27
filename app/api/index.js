var devices = require('./devices');
var dashboards = require('./dashboards');
var weather = require('./weather');
var settingsAPI = require('./settings');
var cameras = require('./cameras');

module.exports.set = function(app) {
    devices.set(app);
    dashboards.set(app);
    weather.set(app);
    settingsAPI.set(app);
    cameras.set(app);
}