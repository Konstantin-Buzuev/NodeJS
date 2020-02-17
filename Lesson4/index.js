const express = require('express')
const path = require('path')
const consolidate = require('consolidate')
const hbs = require('handlebars')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const cookieParser = require('cookie-parser')
const log = console.log
const app = express()
let Agency = require('./models/agency')

//MiddleWare
app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
hbs.registerPartial('menu', fs.readFileSync(path.resolve(__dirname, 'views', 'partials', 'menu.hbs')).toString())
hbs.registerPartial('news', fs.readFileSync(path.resolve(__dirname, 'views', 'partials', 'news.hbs')).toString())
app.set('views', path.resolve(__dirname, "views"))
// Для просмотра body
app.use(express.urlencoded({
    extended: true
}));

app.use(express.static('views'))
app.use(express.static('assets'))
app.use(cookieParser())


app.get('/', (req, res) => {
    let params = {}
    params.news = !req.query.news ? req.cookies.news : req.query.news
    params.category = !req.query.category ? req.cookies.category : req.query.category
    params.count = !req.query.count ? req.cookies.count : req.query.count
    if (!params.news ||
        !params.category ||
        !params.count) res.render('index', {})
    else grabNews(params).then(news => {
        res.render('index', {
            news: news
        })
    })
})
app.post('/', (req, res) => {
    grabNews(req.body).then(news => {
        res.cookie("news", req.body.news)
            .cookie("category", req.body.category)
            .cookie("count", req.body.count)
            .render('index', {
                news: news
            })
    })

})
app.listen(8000, () => {
    log('Server started!')
})

//Функция получения новостей
let grabNews = function (params) {
    return new Promise((resolve, reject) => {
        let url = Agency[params.news].categories[params.category]
        request(url, (err, request, body) => {
            if (!err && request.statusCode === 200) {
                const $ = cheerio.load(body)
                const links = $(Agency[params.news].href[params.count])
                const texts = $(Agency[params.news].text[params.count])
                let news = []
                for (let i = 0; i < links.length && i < texts.length; i++)
                    news.push({
                        text: texts[i].children[0].data,
                        href: links[i].attribs.href
                    })
                resolve(news)
            } else reject(err)
        })
    })
}