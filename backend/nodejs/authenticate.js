var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Users = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');
var config = require('./config.js');


exports.local = passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        Users.findOne({facebookId: profile.id}, (err, user) => {
          
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {

                user = new Users({ username: profile.email});
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.authtype = "facebook";
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
));

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        Users.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});


exports.verifyAdminUser = function(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      res.statusCode = 401;
      res.end('Unauthorized');
      return next();
    }
    req.logIn(user, {session: false}, function(err) {
      if (err) { return next(err); }
      if(user.accesslevel==0){
        res.statusCode = 401;
        res.end('Unauthorized');
        return next();
      }
      next();
    });
  })(req, res, next);
}

exports.verifySuperAdminUser = function(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      res.statusCode = 401;
      res.end('Unauthorized');

      return next();
    }
    req.logIn(user, {session: false}, function(err) {
      if (err) { return next(err); }
      if(user.accesslevel<2){
        res.statusCode = 401;
        res.end('Unauthorized');

        return next();
      }
      next();
    });
  })(req, res, next);
}
