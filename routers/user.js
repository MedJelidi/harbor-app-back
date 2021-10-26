const router = require("express").Router();
const User = require("../models/user");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const passport = require('passport')

router.post("/register", async (req, res) => {
    let user = new User(_.pick(req.body, 'username', 'email', 'phone'))
    user.setPassword(req.body.password)
    try {
        user = await user.save();
        const token = user.generateJwt();
        return res.cookie('access_token', token, {httpOnly: true}).send({message: 'registered'})
    } catch (err) {
        return res.status(500).send(err)
    }
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err)
        if (!user) return res.status(404).send(info)
        const token = user.generateJwt()
        res.cookie('access_token', token, {httpOnly: true}).send({message: 'authenticated'})
    })(req, res, next)
});

router.get("/verify", (req, res) => {
    const token = req.headers.cookie.slice(req.headers.cookie.indexOf('access_token') + 13);
    if (token == null) {
        return res.status(422).send({error: "Please provide token."});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, null, (err) => {
        return err ? res.send(false) : res.send(true);
    });
});

router.get('/logout', (req, res) => {
    const token = req.headers.cookie.slice(req.headers.cookie.indexOf('access_token') + 13);
    res.cookie('access_token', token, {httpOnly: true, maxAge: 0}).send({message: 'logged-out'})
})

module.exports = router;
