var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    debug = require('debug')('tonksDEV:facebook-strategy');

var tonksDEVUser = require('../../models/tonksdevUserModel');

module.exports = function() {
    passport.use(new FacebookStrategy({
        clientID: '501287463415320',
        clientSecret: 'f4a3b618cc0a06f0a427343448881716',
        // callbackURL: 'https://money-tonks.rhcloud.com/auth/facebook/callback',
        callbackURL: 'http://localhost:8080/auth/facebook/callback',
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {

        //create our own custom user object to hold all social details
        var user = {};
        var query = {'facebook.id': profile.id};
        debug(profile);

        tonksDEVUser.findOne(query, function(error, user) {
            if (user) {
                console.log('found user in database - this is a returning user');
                done(null, user);
            } else {
                console.log('did not find user in database - this is a new user');
                var f_user = {}
                f_user = new tonksDEVUser();

                //these lines don't work - check the pluralsight course for info on how to retrieve from the API
                f_user.email = profile.emails;
                f_user.image = profile.photos;

                f_user.displayName = profile.displayName;
                f_user.facebook = {};
                f_user.facebook.id = profile.id;
                f_user.facebook.token = accessToken;
                f_user.save();
                done(null, f_user);
            }
        });
    } ));
}
