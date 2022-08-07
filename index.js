// add all npm imports here
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const csurf = require("csurf")
const helmet = require('helmet');
const fs =require('fs');
const Services = require("./public/data/services.json");

// mongoose require statements bellow...
const User = require("./models/user");
const Appointment = require("./models/appointments");
const { render } = require('ejs');


const app = express();
const csurfProtection = csurf({cookie: true});
const port =  3000 || process.env.PORT; // NEW

// app.use statements bellow
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(cookieParser());

//static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

app.use(session({
    secret: 's3cret',
    resave: true,
    saveUninitialized: true
}));

/**
 * Passport initialization  * 
 */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/**
 * Database connection
 */
const conn = 'mongodb+srv://pet-user:pet1@buwebdev-cluster-1.96qtg.mongodb.net/?retryWrites=true&w=majority'; // NEW
mongoose.connect(conn).then(() => {
    console.log('Connection to the database was successful');
}).catch(err => {
    console.log(`MongoDB Error: ${err.message}`)
})

/**
 * New
 */
app.use((req, res, next) => {
    if (req.session.passport) {
        console.log(req.session.passport.user);
        res.locals.currentUser = req.session.passport.user;
    } else {
        res.locals.currentUser = null;
    }
    next();
})

//CSRF section2
app.use(csurfProtection);
app.use((req, res, next) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    next();
})
app.use(helmet.xssFilter());

// add app.set statements here
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(function(err, req, res, next) {
    console.log(err);
})
// Pages Routes section 
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/grooming', (req, res) => {
    res.render('grooming')
})
app.get('/training', (req, res) => {
    res.render('training')
})
app.get('/boarding', (req, res) => {
    res.render('boarding')
})

//Register page route
app.get('/register', (req, res) => {    
    User.find({}, function (err, user) {
        if (err) {
            console.log(err)
        } else {
            res.render("register", {
                users: user
            })
        }
    })
})

//pull input from register's page
app.post('/register', async(req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    console.log(username + " " + password + " " + email);
    User.register(new User({ username: username, email: email }),
        password, function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect('/register')
            }

            passport.authenticate("local")(
                req, res, function () {
                    res.redirect('/register')
                });
        });
})

//login section
app.get('/login', (req, res) => {
    res.render('login')
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
}), function (req, res) {
});

//This logout user from site
app.get('/logout', (req, res) => {
    req.logout(function(err){
        if (err){
            return next(err);
        }
        res.redirect('/');
    });    
})

//Json section
//pull input from appointment page 
app.get('/schedule',isLoggedIn, (req, res) => {
    let serviceJsonFile =fs.readFileSync("./public/data/services.json");
    let services = JSON.parse(serviceJsonFile); 

    res.render("schedule", {
        services: services
    })
})

//pull input from register's form page
app.post('/schedule', (req, res, next) => {
    const username= res.locals.currentUser;
    const lastName = req.body.lastName;
    const firstName = req.body.firstName;
    const service = req.body.services;
    const email = req.body.email;
   
    console.log(lastName + " " + firstName + " " + service + "" + email);
    let bookAppoint = new Appointment({  
        userName: username,     
        lastName: lastName,
        firstName: firstName,
        email: email,  
        service: service  

    }); 
    Appointment.create(bookAppoint, (err, bookAppoint) =>{
        if(err){
            console.log(err);
        } else {  
                  
            res.redirect("/")
        }
    }) 
})

//pull input from register's form page
app.get("/api/appointments",isLoggedIn,async(req, res)=>{    
    Appointment.find({}, function (err, appoint) {
        if (err) {
            console.log(err)
        } else {
            res.json(appoint);
        }
    })
})

app.get("/profile", isLoggedIn, async (req, res)=>{
    let username = req.session.passport.email;
    let email = req.session.passport.email;
   
   
    Appointment.findOne({username: username}, function (err, appointment){
        if(err){
            console.log(err);
        }else {
            res.render("profile", {
                appointments:appointment,                
                email: email,
            })
        }
    })

})

// check isLoggedIn
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// Listen on Port 3000
app.listen(port, () => console.info(`Listening on port ${port}`))


