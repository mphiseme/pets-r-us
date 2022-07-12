//imports
const express= require('express');
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const User = require("./models/user");
const Login = require("./models/login");
const { json } = require('express');
const passport = require('passport');
const app = express();
const assert = require('assert')
const session = require('express-session');
const flash = require("express-flash")
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const { authenticate } = require('passport');
const csrf = require("csurf")
const helmet = require('helmet');
const port = 3005; 

app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(cookieParser());
app.use(flash());
app.use(session({
    secret: 's3cret',
    //resave: true,
    resave: false,
    //saveUninitialized: true
    saveUninitialized: false
}));

//static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

//CSRF section
const csurfProtection = csrf({ cookie: true });

//CSRF section2
app.use(csurfProtection);
app.use((req, res, next)=>{
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);
    res.locals.csrfToken = token;
    next();
})

//This is to prevent cross-site scripting
app.use(helmet.xssFilter());

//Set Views
app.set('views', './views')
app.set('view engine', 'ejs')
//app.engine('.html', require('ejs').__express);
//app.set('view engine', 'html')


app.get('/register', (req, res) => {
    //res.render('register')
    User.find({}, function(err, users){
      if(err){
        console.log(err)
      }else{
        res.render("register", {
          users:users
        })
      }
    })
}) 

app.get('/login', (reg, res)=> {
    res.render('login')
})

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



//let dbConn = mongodb.connect("mongodb+srv://pet-user:pet1@buwebdev-cluster-1.96qtg.mongodb.net/?retryWrites=true&w=majority");
mongoose.connect("mongodb+srv://pet-user:pet1@buwebdev-cluster-1.96qtg.mongodb.net/?retryWrites=true&w=majority");
let db = mongoose.connection;

 function initializePassport(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        {
            if(user === null){
                return done(null, false, {message:'No user with that email'})
            }
            try {
                if (await bcrypt.compare(password, user.password)){
                    return done(null, user)

                } else {
                  return done(null, false, {message: 'Password incorrect'}) 

                }
            } catch (e) {
                return done(e)

            }
        }

    }
    //passport.serializeUser(User.serializeUser());
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser ))
    passport.serializeUser((user, done)=> done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })


}
 initializePassport(passport, email => {
   User.find(user => user.email === email),
   id => User.find(user => user.id === id)
   
 }) 

//passport.js
app.use(passport.initialize());
app.use(passport.session());


//check for errors with connection to database
db.on('error',()=> console.log("Error in connecting to Database"));
db.once("open", ()=>console.log("connected to Database"));


   app.get('/user_list', (req, res) => {   
    //const collectionB = db.collection("users");
    User.find({}).toArray(function(err, users){
        console.log(users)
        assert.equal(err, null);        
       
        res.render('user_list.ejs', {
            "users": users,
            csrfToken: req.csrfToken(), 
        })                 
    })     
});

/*
//Testing register page
app.get("/register", (req, res) => {
    User.find({}, function (err, users) {
      if (err) {
        console.log(err);
      } else {
        res.render("register", {
          users: users,          
        });
      }
    });
  }); */


//this code encrypt 
app.post('/register', async (req, res) => {
  try{  

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username:req.body.name, 
      password: hashedPassword,
      email:req.body.email,
    })
    console.log(user)
    res.redirect('/user_list')
  } catch {
    res.redirect('/register')
  }  
  
 });
 /*
//Login route 
app.post('/login', passport.authenticate('local',{
    successRedirect: '',
    failureRedirect: '/login',
    failureFlash: true
}));*/


// check whether user input correct to have them log in
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"    
}), 
function (req, res) {});

// check isLoggedIn
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Logout section  
app.get("/logout", (req, res) => {
  res.render('logout');
});

  app.get('/logout', (req, res) => {
  req.logout(function (err){
    if(err){
      return next(err);
    }
  });
    res.redirect('index');
  });
  
// Listen on Port 3000
app.listen(port, ()=> console.info(`Listening on port ${port}`))


