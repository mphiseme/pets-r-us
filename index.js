//imports
const express= require('express');
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const User = require("./models/user");
const { json } = require('express');
const passport = require('passport');
const app = express();
const assert = require('assert')
const session = require('express-session');
const LocalStrategy = require('passport-local');
const cookieParser = require('cookie-parser');
const port = 3005; 





//static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))
//app.use(express.urlencoded({extended: true})); 
//app.use(express.json());

//Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('', (req, res) => {
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

app.use(express.urlencoded({extended: true}))
app.use(express.json());

//let dbConn = mongodb.connect("mongodb+srv://pet-user:pet1@buwebdev-cluster-1.96qtg.mongodb.net/?retryWrites=true&w=majority");
mongoose.connect("mongodb+srv://pet-user:pet1@buwebdev-cluster-1.96qtg.mongodb.net/?retryWrites=true&w=majority");
let db = mongoose.connection;

app.use(cookieParser());
app.use(session({
    secret: 's3cret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//check for errors with connection to database
db.on('error',()=> console.log("Error in connecting to Database"));
db.once("open", ()=>console.log("connected to Database"));


   app.get('/user_list', (req, res) => {   
    const collectionB = db.collection("users");
    collectionB.find({}).toArray(function(err, users){
        console.log(users)
        assert.equal(err, null);        
       
        res.render('user_list', {users: users})        
    })  
   
})

   app.post('/register', (req, res, next) => {
    const username = req.body.name;
    const password = req.body.password;
   
  
    User.register(new User({username: username}), password, function (err, user) {
      if (err) {
        console.log(err);
        return res.redirect('/register');
      }
      passport.authenticate("local")(
        req, res, function () {
          res.redirect('/register')
        });
    })
   })

   app.post('users', (req, res) => {
    const userName = req.body.name;
  
    console.log(req.body);
    let user = new User ({
      name: userName
    })
  
    User.create(user, function (err, users) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    })
  })

        



  
// Listen on Port 3000
app.listen(port, ()=> console.info(`Listening on port ${port}`))


