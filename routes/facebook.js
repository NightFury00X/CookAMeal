const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

passport.use(new FacebookStrategy({
        clientID: '299744253859215',
        clientSecret: '273ecbcf51e1ded55a808f90835b196b',
        callbackURL: 'localhost:8081'
    }, function (accessToken, refreshToken, profile, done) {
        console.log('Profile: ', profile)
        console.log('Profile: ', accessToken)
        console.log('Profile: ', refreshToken)
    }
))

module.exports = passport
