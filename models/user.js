/**
 *  Title: user_list.ejs
    Author: Manel Phiseme
    Date: 7/3/2022
    Description: model.
 */ 

//import mongoose module and passport-local-mongoose module
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');

// mongoose Schema model
let userSchema = new mongoose.Schema({     
  //  password: {type: String, required:true},
    username: {type: String, required: true}, 
    email: {type: String, required: true},   
    createdAT: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);

//export mongoose model
module.exports = mongoose.model("User", userSchema);
