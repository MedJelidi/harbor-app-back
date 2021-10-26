const express = require("express");
const app = express();

const user = require("./routers/user");
const engine = require("./routers/engine");
const mongoose = require("mongoose");
const cors = require('cors');
const cookieParser = require('cookie-parser')
const passport = require('passport')
require('./config/passport')
const dotenv = require("dotenv");
const PORT = process.env.PORT || 3000;

dotenv.config();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
}))
app.use(cookieParser());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
app.use(express.static('public'));

app.use(passport.initialize())
// app.use(passport.session())
app.use("/api/user", user);
app.use("/api/engine", engine);

const mongooseConnection = mongoose
    .connect(process.env.DB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to database...");
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch((err) => {
        console.log("Error connecting to database...", err);
        process.exit(1);
    });

module.exports.mongooseConnection = mongooseConnection
module.exports.app = app
