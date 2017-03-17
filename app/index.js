const express = require('express');
const app = express();
var port = 3000;
const path = require('path');
const request = require('request');
const exphbs = require('express-handlebars');
var controllers = require('./controllers');
const appRoot = require('app-root-path');
var SelfReloadJSON = require('self-reload-json');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var api = require('./api/');

if (config.settings.port) {
    port = config.settings.port;
}
controllers.set(app);
api.set(app);
app.use(express.static('public'));

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
});

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

//enable caching
//app.enable('view cache');