console.log("Installing config files for a blank install")
var fs = require('fs');
var settings = { "settings": { "version": "0.5", "token": "", "apiUrl": "", "clientId": "", "clientSecret": "" } };
var updates = { "updates": "" };
var smartthings = { "devices": "" };
var dashboards = { "dashboards": [] };
var cameras = { "cameras": [] };

if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

if (!fs.existsSync('data/settings.json')) {
    //create settings.json
    fs.writeFile('data/settings.json', JSON.stringify(settings), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

if (!fs.existsSync('data/updates.json')) {
    //create settings.json
    fs.writeFile('data/updates.json', JSON.stringify(updates), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

if (!fs.existsSync('data/smartthings.json')) {
    //create settings.json
    fs.writeFile('data/smartthings.json', JSON.stringify(devices), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

if (!fs.existsSync('data/dashboards.json')) {
    //create settings.json
    fs.writeFile('data/dashboards.json', JSON.stringify(dashboards), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};

if (!fs.existsSync('data/cameras.json')) {
    //create settings.json
    fs.writeFile('data/cameras.json', JSON.stringify(cameras), function(err) {
        if (err) {
            return console.log(err);
        }
    });
};