var fs = require('fs');
var uuid = require('uuid');
console.log("backing up data/dashboards.json")
fs.writeFileSync('data/dashboards.bak', fs.readFileSync('data/dashboards.json'));
var obj = JSON.parse(fs.readFileSync('data/dashboards.json', 'utf8'));
for (var x in obj.dashboards) {
    var devices = obj.dashboards[x].devices;
    devices.forEach(d => {
        if (!d.api) {
            d.api = "smartthings";
        }
        if (!d.dashDevId) {
            d.dashDevId = uuid.v1();
        }
    })
}

fs.writeFile('data/dashboards.json', JSON.stringify(obj), function(err) {
    if (err) return console.error(err);
    console.log('done upgrading');
})