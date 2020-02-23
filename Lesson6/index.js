const express = require('express');
const path = require('path');
const consolidate = require('consolidate');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('./middleware/passport');
const router = require('./router')

mongoose.connect('mongodb://192.168.99.100:32769/insta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const app = express();

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use('/styles', express.static(path.resolve(__dirname, 'assets/css')));
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'secret phrase', // ключ
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
}));
app.use(passport.initialize);
app.use(passport.session);
app.use(router);

app.listen(8000, () => {
    console.log('Server has been started!');
});