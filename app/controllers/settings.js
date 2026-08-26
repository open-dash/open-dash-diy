const express = require('express');
const app = express();
var SelfReloadJSON = require('self-reload-json');
const appRoot = require('app-root-path');
var config = new SelfReloadJSON(appRoot + '/data/settings.json');
var styles = new SelfReloadJSON(appRoot + '/data/styles.json');
const { AuthorizationCode } = require('simple-oauth2');
const httpRequest = require('../lib/http');
const localIp = require('../lib/local-ip');
var oauth2;
var accessURL;
var authorizationUri;
var endpoints_uri = 'https://graph.api.smartthings.com/api/smartapps/endpoints';


module.exports.set = function(app) {

    app.get('/settings', (request, response) => {
        var css = Buffer.from(styles.styles.global, 'base64').toString();
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

    app.get('/settings/callback', async function(req, res) {
        const code = req.query.code;
        try {
            initOauth();
        } catch (err) {
            console.log("no client or secret set");
            return res.status(500).send('OAuth not configured');
        }
        var redirectUrl = "http://" + localIp.address() + ":3000/settings/callback";

        try {
            const accessToken = await oauth2.getToken({
                code: code,
                redirect_uri: redirectUrl
            });
            const result = accessToken.token;
            config.settings.token = result.access_token;

            var sendreq = {
                method: "GET",
                uri: endpoints_uri + "?access_token=" + result.access_token
            };
            httpRequest(sendreq, function(err, res1, body) {
                if (err) {
                    console.log('Endpoints Error', err.message);
                    return res.status(500).send('Failed to load endpoints');
                }
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
        } catch (error) {
            console.log('Access Token Error', error.message);
            res.status(500).send('Access Token Error');
        }
    });

    app.get('/settings/endpoints', function(req, res) {
        var token = config.settings.token;
        var options = {
            uri: endpoints_uri + "?access_token=" + token,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };
        httpRequest(options, function(err, res1, body) {
            var endpoints = JSON.parse(body);
            res.send('endpoints are: ' + endpoints[0].location.name + endpoints[0].uri);
        });
    });

    var initOauth = function() {
        oauth2 = new AuthorizationCode({
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
        var redirectUrl = "http://" + localIp.address() + ":3000/settings/callback";
        authorizationUri = oauth2.authorizeURL({
            redirect_uri: redirectUrl,
            scope: 'app',
            state: '3(#0/!~'
        });
    };
};
