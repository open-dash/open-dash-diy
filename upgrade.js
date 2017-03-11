var fs = require('fs');
console.log("backing up data/dashboards.json")
fs.writeFileSync('data/dashboards.bak', fs.readFileSync('data/dashboards.json'));
var obj = JSON.parse(fs.readFileSync('data/dashboards.json', 'utf8'));
for (var x in obj.dashboards) {
    var devices = obj.dashboards[x].devices;
    devices.forEach(d => {
        if (!d.api) {
            d.api = "smartthings";
        }
    })
}

fs.writeFile('data/dashboards.json', JSON.stringify(obj), function(err) {
    if (err) return console.error(err);
    console.log('done upgrading');
})