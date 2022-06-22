//imports
const express= require('express');
//const router = express.Router();
const app = express();
const port = 3005;

//static files

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))

//Set Views
app.set('views', './views')
app.set('view engine', 'ejs')

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


/**
 * 
 app.use(express.static(__dirname + '/public'));
app.get('/index/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
})
 
 */

/**
 *  router.get('/', (req, res, next) => {
    res.render('home')
})

router.get('/grooming', (req, res, next) => {
    res.render('grooming')
}) 
 */


 









// Listen on Port 3000
app.listen(port, ()=> console.info(`Listening on port ${port}`))