const express = require('express')
const path = require('path')
const consolidate = require('consolidate')
const log = console.log
const app = express()

//MiddleWare
app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, "views"))
// Для просмотра body
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('views'))
app.use(express.static('assets'))

app.get('/', (req, res) => {
    res.render('view', {})
})
app.post('/tasks', (req, res) => {
    log(req.body)
    res.send("OK")
})
app.listen(8000, () => {
    log('Server started!')
})