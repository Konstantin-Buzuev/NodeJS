const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log
const Menu = require("./menu")
const BlackJack = require("./blackjack")
const Logger = require("./logger")
const HeadsAndTails = require('./headsNtails')

// Получение входных параметров
let argv = require('minimist')(process.argv.slice(2), {
    alias: {
        canRib: 'r',
        deckType: 't',
        deckFlush: 'f',
        difficulty: 'd',
        user: 'u',
        logPath: 'l',
        showTits: 't'
    }
})
if (argv.showTits) log("(.)(.)") // Ну это же казино с блекджеком... ;)
// Их обработка
function getUser() {
    let nameQuestion = {
        type: "input",
        name: "user",
        message: chalk.yellowBright("Добро пожаловать в наше казино! Как вас называть?")
    }
    return inquirer.prompt(nameQuestion).then(answer => {
        user = answer.user
    })
}
let user
async function game() {
    if (argv.user === undefined) await getUser()
    else user = argv.user
    let gameMenu = new Menu(user, blackJack, headsNtails, logger)
    gameMenu.menu.handle()
}
// Создаем объекты: игры казино и логгер
let logger = new Logger((argv.logPath === undefined) ? "log.txt" : argv.logPath)

let blackJack = new BlackJack({
    deckType: argv.deckType,
    deckFlush: argv.deckFlush,
    difficulty: argv.difficulty
})
let headsNtails = new HeadsAndTails({
    canRib: argv.canRib
})

// Основной код скрипта
game()
//

/*
//------------------------------

//------------------------------
//    mainMenu.handle()
*/