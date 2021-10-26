const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.cookie.slice(req.headers.cookie.indexOf('access_token') + 13);
    if (token == null) {
        return res.status(422).send({error: "Access denied. No token provided."});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, null, (err) => {
        return err ? res.status(401).send({ error: "token invalid." }) : next();
    });
};
