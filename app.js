const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const mongostore = require('connect-mongo')
const { engine } = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const User = require('./models/user')
const app = express();
const port = 3000
const mongo_uri = "mongodb://localhost:27017/test-app"
const bodyParser = require('body-parser');
const { hashPasswd } = require('./lib/passwordUtils');
require('./config/passport')(passport)


mongoose.connect(mongo_uri, {
    useNewurlParser: true
})

mongoose.connection.once('open', () => { console.log("db connected") }).on('error', (err) => { console.error(err) })

app.engine('.hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({
    secret: "abcd",
    resave: false,
    saveUninitialized: true,
    store: mongostore.create({
        mongoUrl: 'mongodb://localhost/test-app',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.render('home')
})


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.post('/signup', async (req, res) => {
    const { name, email, passwd } = req.body
    const encrypt = hashPasswd(passwd)
    let user = await User.findOne({ email })
    if (!user) {
        user = new User({ name, email, salt: encrypt.salt, password: encrypt.hash })
        try {
            await user.save()
            res.redirect('/login')
        } catch (err) {
            console.error(err)
        }
    }
    else{
        res.render('signup',{msg : "User Already Exists Please logIn"})
    }
})
// one way of doing it but in this we cant use the flash message we are using in the done function 
// app.post('/login' , passport.authenticate('local' , {
//     successRedirect : '/p',
//     failureRedirect : '/'
// }))

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        // console.log(user, err, info)
        if (err) { return next(err) }
        if (!user) {
            // console.log(info)
            return res.render('login', { message: info.message })
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.redirect('/p');
        });
    })(req, res, next);
});

app.get('/login', (req, res) => {
    res.render('login', { err: req.session.error, message: req.session.msg, })
})
//helper function to check the user is Authenticated or not
const isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
    } else {
        next()
    }
}
app.get('/p', isAuthenticated, (req, res) => {
    const name = req.user.name
    const email = req.user.email
    res.render('user', { name, email })
})
app.get("/logout", (req, res, next) => {
    req.logout(req.user, (err) => {
        if (err) next(err)
        res.redirect("/login");
    });

});


app.listen(port, () => {
    console.log(`server is connected to ${port}`)
})