var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    tonksDEVUser = require('../../models/tonksdevUserModel'),
    debug = require('debug')('tonksDEV:google-auth');

module.exports = function(tonksDEVapp) {
    'use strict';

    //set callback based on environment
    var authCallBack = '';
    switch (tonksDEVapp.get('env')) {
        case 'production':
            authCallBack = 'https://money-tonks.rhcloud.com/auth/google/callback';
            break;
        case 'c9':
            authCallBack = 'https://money-unnecessaryroughness.c9users.io/auth/google/callback';
            break;
        default:
            authCallBack = 'http://localhost:8080/auth/google/callback';
            break;
    }

    passport.use(new GoogleStrategy({
            clientID: '430969087731-a47i215viu0akr6g7vmvnuqkq0kqjpj8.apps.googleusercontent.com',
                        //identifies this application
            clientSecret: 'zj9ucehT1939AEwwiT2zk7LA',
                        //identifies this application
            callbackURL: authCallBack
                        //where will Google send us back to after authenticating?
            },
            function(req, accessToken, refreshToken, profile, done) {
                        //function to call after control comes back

                debug('control returned from Google');

                //create our own custom user object to hold all social details

                tonksDEVUser.findOne({'google.id': profile.id}, function(error, user) {
                    if (user) {
                        debug('found user in database - this is a returning user');
                        done(null, user);
                    } else {
                        debug('did not find user in database - this is a new user');
                        var g_user = {};
                        g_user = new tonksDEVUser();
                        g_user.email = profile.emails[0].value;
                        g_user.image = profile._json.image.url;
                        g_user.displayName = profile.displayName;
                        g_user.google = {};
                        g_user.google.id = profile.id;
                        g_user.google.token = accessToken;
                        g_user.save();
                        done(null, g_user);
                    }
                });
            }
    ));
};
