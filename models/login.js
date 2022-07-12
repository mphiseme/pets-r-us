/**
 *  Title: login.js
    Author: Manel Phiseme
    Date: 7/4/2022
    Description: log model.
 */ 

//import mongoose module and passport-local-mongoose module
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

// mongoose Schema model
let userSchema = new mongoose.Schema({       
    createdAT: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);

//export mongoose model
module.exports = mongoose.model("login", userSchema);


