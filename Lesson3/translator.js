const keyValue = "trnsl.1.1.20200118T124813Z.f89cc2ab9c37bc82.d4cb31bcb7abfcdbe774a1ef52a8b80da77a8be9"
let urlutils = require('url')
let inquirer = require("inquirer")
let request = require("request")
let chalk = require("chalk")
let log = console.log
let argv = require('minimist')(process.argv.slice(2), {
    alias: {
        textForTranslation: 't',
        language: 'l'
    }
})
//-------------------------------------
Translate()
//-------------------------------------
async function Translate() {
    if (argv.textForTranslation === undefined) await PromptText()
    makeTranslation(argv)
}
//-------------------------------------
function makeTranslation(obj) {
    let params = {}
    params.protocol = "https:"
    params.slashes = true
    params.host = "translate.yandex.net"
    params.pathname = "/api/v1.5/tr.json/translate"
    params.query = {
        key: keyValue,
        text: obj.textForTranslation,
        lang: obj.language,
        format: "plain",
        options: 1
    }
    request(urlutils.format(params), (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let obj = JSON.parse(body)
            log(chalk.blue("Перевод вашего текста: ") + chalk.greenBright(obj.text))
        }
    })
}
//-------------------------------------
async function PromptText() {
    let questions = [{
            type: 'input',
            name: "textForTranslation",
            message: chalk.blue("Введите текст, который вы хотите перевести")
        },
        {
            type: 'list',
            name: "language",
            message: chalk.blue("Выберите язык, на который нужно перевести"),
            choices: [{
                    name: "Английский",
                    value: "en"
                },
                {
                    name: "Немецкий",
                    value: "de"
                },
                {
                    name: "Китайский",
                    value: "zh"
                }
            ]
        }
    ]
    return inquirer.prompt(questions).then(answers => {
        argv = answers
    })
}