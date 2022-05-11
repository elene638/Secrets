require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

//console.log(md5("123456")); check if hashed password and password is the same

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

//const secret = "Thisisourlittlesecret";
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

//secret: secret - is the secret to use to encrypt the password

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home")
});

app.get("/login", function (req, res) {
    res.render("login")
});

app.get("/register", function (req, res) {
    res.render("register")
});
//to make password in hash and it is inreversable
app.post("/register", function (req, res) {
    const newUser = new User ({
        email: req.body.username,
        password: md5(req.body.password)
    });

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render("secrets")
        }
    })
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if(foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    });
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});