require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds  = 10;
const session = require ("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); 

const app = express();

//console.log(md5("123456")); check if hashed password and password is the same

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


//set up a session
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

//initialize passport
app.use(passport.initialize());
//use passport
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

//set up passport local mongoose
userSchema.plugin(passportLocalMongoose);

//const secret = "Thisisourlittlesecret";
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

//secret: secret - is the secret to use to encrypt the password

const User = mongoose.model("User", userSchema);
//identification of the password 386
passport.use(User.createStrategy());
//for sessions serialise gets message stores
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home")
});

app.get("/login", function (req, res) {
    res.render("login")
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) {
    //see if user is already logged in tahn go to secrets if not logg them in
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {
   User.register({username: req.body.username}, req.body.password, function (err, user) {
       if (err) {
           console.log(err);
           res.redirect("/register")
       } else {
           passport.authenticate("local")(req, res, function () {
               res.redirect("/secrets")
           })
       }
   })
    
});

app.post("/login", function (req, res) {
   const user = new User ({
       username: req.body.username,
       password: req.body.password
   })
   //login and authenticate the user
   req.login(user, function (err) {
      if (err) {
          console.log(err);
      } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/secrets")
        })
      }
   })
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});

//md5(req.body.password)
//found userFound = hash passworded is compared to hash genereated password
// in bcrypt compare if the result from comparing is true, so if result is true and they are the same passwords then we can render the secrets route
// login route
// const username = req.body.username;
// const password = req.body.password;
// //rehashing const password = md5(req.body.password);
// User.findOne({email: username}, function (err, foundUser) {
//     if (err) {
//         console.log(err);
//     } else {
//         if (foundUser) {
//             if(foundUser.password === password) {
//                 bcrypt.compare(password, foundUser.password, function(err, result) {
//                     if (result === true) {
//                         res.render("secrets");
//                     }
//                 });
               
//             }
//         }
//     }
// });

//register
// res.render("register")
// });
// //to make password in hash and it is inreversable
// //hash is the password that is generated after salting 10 times
// app.post("/register", function (req, res) {
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//         const newUser = new User ({
//             email: req.body.username,
//             password: hash
//         });
    
//         newUser.save(function (err) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.render("secrets")
//             }
//         });
//     });