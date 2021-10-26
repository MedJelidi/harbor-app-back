const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then(user => {
            done(null, user)
        })
        .catch(err => {
            done(err)
        })
})

passport.use(new LocalStrategy(
    (username, password, done) => {
        User.findOne({username: username}, async function (err, user) {
            if (err) return done(err)
            if (!user) return done(null, false, {message: 'Utilisateur inconnu.'})
            user.setPassword(password)
            if (!(await user.validPassword(password))) return done(null, false, {message: 'Mot de passe incorrecte.'})
            return done(null, user)
        });
    }))
