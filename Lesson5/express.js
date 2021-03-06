const express = require('express');
const path = require('path');
const consolidate = require('consolidate');
const mongoose = require('mongoose');
const log = console.log
// Connecting to database
mongoose.connect('mongodb://192.168.99.100:32768/insta', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();

// Настраиваем handlebars
app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware
app.use(express.json());
// Необходимо для парсинга body в пост запросах. extended указывает на возможность парсть вложенные структуры.
app.use(express.urlencoded({
    extended: true
}));
// Опишем статику для стилей. Аналогично можно расписать для других статичных ресурсов.
app.use('/styles', express.static(path.resolve(__dirname, 'assets/css')));

// Роутинг
// описываем общий обработчик для всех роутов
// app.all('/', (req, res, next) => {
//     console.log('all');
//     next();
// });
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'));
});

const User = require('./models/user');

app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});

app.post('/users', async (req, res) => {
    if (Array.isArray(req.body)) {
        let savedUsers = []
        for (let i = 0; i < req.body.length; i++) {
            const user = new User(req.body[i]);
            const savedUser = await user.save();
            savedUsers.push(savedUser);
        }
        res.json(savedUsers)
    } else {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.json(savedUser);
    }
});

app.put('/users/:id', async (req, res) => {
    const user = new User(req.body);
    user._id = req.params.id;
    const updatedUser = await user.update(user)
    res.json(user);
})

app.delete('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    const deletedUser = await user.remove();
    res.json(deletedUser);
})

app.listen(8000, () => {
    console.log('Server has been started!');
});