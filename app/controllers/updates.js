const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const request = require('request');
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
const dashboards = require('../../data/dashboards.json');
var smartthings = new SelfReloadJSON(appRoot + '/data/smartthings.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
const simpleOauthModule = require('simple-oauth2');
var ip = require('ip');
var oauth2;
var accessURL;
var authorizationUri;
var endpoints_uri = 'https://graph.api.smartthings.com/api/smartapps/endpoints';


module.exports.set = function(app) {

    app.get('/settings', (request, response) => {
        response.render('settings', {
            version: config.settings.version,
            settings: config.settings,
            css: css
        });
    });

    app.get('/settings/auth', function(req, res) {
        //console.log(authorizationUri)';
        try {
            initOauth();
        } catch (err) {
            console.log("no client or secret set");
        }
        res.redirect(authorizationUri);
    });

    app.get('/settings/callback', function(req, res) {
        const code = req.query.code;
        try {
            initOauth();
        } catch (err) {
            console.log("no client or secret set");
        }
        var redirectUrl = "http://" + ip.address() + ":3000/settings/callback";

        oauth2.authorizationCode.getToken({
            code: code,
            redirect_uri: redirectUrl
        }, saveToken);

        function saveToken(error, result) {
            if (error) {
                console.log('Access Token Error', error.message);
            } else {
                config.settings.token = result.access_token;

                var sendreq = {
                    method: "GET",
                    uri: endpoints_uri + "?access_token=" + result.access_token
                };
                request(sendreq, function(err, res1, body) {
                    var endpoints = JSON.parse(body);
                    //TODO store locations information location.id and location.home
                    //console.log(endpoints);
                    // we just show the final access URL and Bearer code
                    var access_url = endpoints[0].url

                    accessURL = 'https://graph.api.smartthings.com/' + access_url;
                    apiURL = endpoints[0].uri;

                    config.settings.apiUrl = apiURL;
                    config.save();
                    res.render('settings', {
                        version: config.settings.version,
                        settings: config.settings
                    });

                });
            }
        }
    });

    app.get('/settings/endpoints', function(req, res) {
        var response = "";
        var options = {
            uri: endpoints_uri + "?access_token=" + token,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };
        request(options, function(err, res1, body) {
            var endpoints = JSON.parse(body);
            res.send('endpoints are: ' + endpoints[0].location.name + endpoints[0].uri);
        });
    });

    var initOauth = function() {
        oauth2 = simpleOauthModule.create({
            client: {
                id: config.settings.clientId,
                secret: config.settings.clientSecret
            },
            auth: {
                tokenHost: 'https://graph.api.smartthings.com',
                tokenPath: '/oauth/token',
                authorizePath: '/oauth/authorize',
            },
        });
        var redirectUrl = "http://" + ip.address() + ":3000/settings/callback";
        authorizationUri = oauth2.authorizationCode.authorizeURL({
            redirect_uri: redirectUrl,
            scope: 'app',
            state: '3(#0/!~'
        });
    };
};