const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStartegy = require('passport-local');


//Create Local Strategy

const localOptions = {usernameField: 'email'}
const localLogin = new LocalStartegy(localOptions, function(email,password,done){
    // verify this username and password, call done with the user
    // if it is the correct username
    //otherwise , call done with false
    User.findOne({email: email},function(err,user){
        if(err) {return done(err); }

        if(!user) {return done(null,false); }

        //compare passwords - is 'password' equal to user.password?

        user.comparePassword(password,function(err,isMatch){
            if(err) {return done(err); }
            if(!isMatch) { return done(null, false); }

            return done(null,user);
        })
    })
})

//Setup options for JWT strategy

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

//Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
    // See if the user ID in the payload exists in our database
    //If it does, call 'done' with that user
    //otherwise,call done without a user objet
    User.findById(payload.sub, function(err, user){
        if(err) { return done(err, false); }

        if(user){
            done(null,user);
        } else{
            done(null, false);
        }
    })
})


//Tell passport to use this strategy
passport.use(jwtLogin);

passport.use(localLogin);