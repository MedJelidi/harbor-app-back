const mongoose = require('mongoose')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true},
    phone: String,
    salt: String,
    hash: String
})

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex')
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex')
}

userSchema.methods.validPassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex')
    return this.hash === hash
}

userSchema.methods.generateJwt = function () {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 7)
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        exp: parseInt(expiry.getTime() / 1000)
    }, process.env.TOKEN_SECRET)
}

module.exports = mongoose.model('User', userSchema)
