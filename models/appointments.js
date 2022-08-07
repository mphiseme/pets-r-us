/**
 *  Title: appointment.js
    Author: Manel Phiseme
    Date: 7/17/2022
    Description: appointment model.
 */ 

//import mongoose module and passport-local-mongoose module
const mongoose = require('mongoose')


// mongoose Schema model
let appointSchema = new mongoose.Schema({  
    userName: {type: String},
    firstName: {type: String, require: true},
    lastName: {type: String, require: true},
    email: {type: String, require: true},
    service: {type: String, require: true},
    createdAT: { type: Date, default: Date.now },
});


//export mongoose model
module.exports = mongoose.model("Appointments", appointSchema);


