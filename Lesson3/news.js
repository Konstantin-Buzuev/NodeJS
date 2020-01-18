let request = require("request")
let cheerio = require("cheerio")
let chalk = require("chalk")
let news = []
news.push(chalk.yellowBright("Новости на портале GeekBrains:"))
request('https://geekbrains.ru/posts', (err, response, body) => {
    if (!err && response.statusCode === 200) {
        let $ = cheerio.load(body)
        $('.post-item__title').each((i, element) => {
            news.push(chalk.blueBright(element.children[0].data) + "  " +
                chalk.greenBright("https://geekbrains.ru" + element.attribs.href))
        })
        console.log(news.join("\n"))
    }
});