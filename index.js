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

// mongoose require statements bellow...
const User = require("./models/user");
const Booking = require("./public/data/services.json");
console.log(Booking);

const app = express();
const csurfProtection = csurf({cookie: true});
const port = 3000 || process.env.PORT; // NEW

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
//Appointment Page
app.get('/appointment', (req, res) =>{
    res.render('appointment')
})

app.get('/register', (req, res) => {
    //res.render('register')
    User.find({}, function (err, users) {
        if (err) {
            console.log(err)
        } else {
            res.render("register", {
                users: users
            })
        }
    })
})

//pull input from register's gage
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

//pull input from appointment page gage
app.post('/appointment', async(req, res, next) => {
    const username = req.body.username;
    const lastName = req.body.lastName;
    const firstName = req.body.firstName;
    const password = req.body.password;
    const email = req.body.email;

    console.log(username + " " + password + " " + email);
    Booking.register(new Booking({ username: username,firstName:firstName, lastName:lastName, email: email }),
        password, function (err, user) {
            if (err) {
                console.log(err);
                return res.redirect('/')
            }

            passport.authenticate("local")(
                req, res, function () {
                    res.redirect('/')
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

/**
 * app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
 */
app.get('/logout', (req, res) => {
    req.logout(function(err){
        if (err){
            return next(err);
        }
        res.redirect('/');
    });    
})

app.get('/user_list', (req, res) => {
    //const collectionB = db.collection("users");
    User.find({}).toArray(function (err, users) {
        console.log(users)
        assert.equal(err, null);

        res.render('user_list.ejs', {
            "users": users,
            csrfToken: req.csrfToken(),
        })
    })
});

//Json section
  fs.readFile("booking", (err, data) =>{
    if (err) {
        console.log("File read failed:", err);
    return;

    }   
    console.log("File data:", jsonString);    
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


