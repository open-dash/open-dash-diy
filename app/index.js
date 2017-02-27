const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const request = require('request');
const exphbs = require('express-handlebars');
var controllers = require('./controllers');
var api = require('./api/');

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