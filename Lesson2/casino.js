const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log
const menuItem = require("./menu")
const BlackJack = require("./blackjack")
const Logger = require("./logger")
const Record = require("./logger")
const HeadsAndTails = require('./headsNtails')

// Обработка входных параметров
let argv = require('minimist')(process.argv.slice(2), {
    alias: {
        canRib: 'r',
        deckType: 't',
        deckFlush: 'f',
        difficulty: 'd',
        user: 'u',
        logPath: 'l'
    }
})
/*
async function getUser() {
    if (argv.user !== undefined) return argv.user
    let nameQuestion = {
        type: "input",
        name: "user",
        message: chalk.yellowBright("Добро пожаловать в наше казино! Как вас называть?")
    }
    let promise = await inquirer.prompt(nameQuestion).then(answer => {
        let user = answer.user
    })

    return user
}

let user = getUser()
*/

log(user)
/*
// Создаем объекты: игры казино
let blackJack = new BlackJack(argv)
//let headsNtails = new HeadsAndTails(argv)
let logger = new Logger((argv.logPath === undefined) ? "log.txt" : argv.logPath)



// Добавляем главное меню казино
let mainMenu = new menuItem(
    "main",
    "Главное меню",
    "Что желаете сделать,",
    function (user) {
        return user.name
    }, new Record("", "", "")) // messageModifer, parent, action = null по-умолчанию
mainMenu.setRoot()
mainMenu.setQuit(() => {
    log(chalk.yellowBright(`Спасибо за игру в нашем казино, ${mainMenu.obj.name}! Заходите ещё!`))
})
// Добавляем меню игры БлэкДжек в основное меню
let menuBlack = new menuItem("blackJack",
    'Игра "Блэкджек"',
    "Выберите ваши действия",
    null,
    blackJack)
mainMenu.addChild(menuBlack)
mainMenu.findChildByName("blackJack").addAction(function (obj) {
    mainMenu.obj.game = "BlackJack"
})
// Добавляем пункты меню в блэкджек
menuBlack.addChild(new menuItem(
    "playGame",
    "Сыграть в блэкджек",
    "Выберите пункт меню"))
menuBlack.addChild(new menuItem( // присвоение родителя в самом методе addChild
    "options",
    "Опции",
    "Выберите опцию"))
// Добавляем Играть->Новая игра
menuBlack.findChildByName("playGame").addChild(new menuItem(
    "new",
    "Новая игра",
    "Что скажете крупье?"
))
menuBlack.findChildByName("new").addAction(() => {
    blackJack.newGame()
    if (menuBlack.findChildByName("takeCard") === null) {
        menuBlack.findChildByName("new").addChild(new menuItem(
            "takeCard",
            "Карту!"
        ))
        menuBlack.findChildByName("takeCard").addAction(function (obj) {
            blackJack.playerAction(mainMenu.obj)
            if (blackJack.gameOver) {
                menuBlack.findChildByName("new").removeChildByName("takeCard")
                menuBlack.findChildByName("new").removeChildByName("stand")
                menuBlack.findChildByName("new").removeChildByName("save")
                logger.add(mainMenu.obj)
            }
        })
    }
    if (menuBlack.findChildByName("stand") === null) {
        menuBlack.findChildByName("new").addChild(new menuItem(
            "stand",
            "Себе!"
        ))
        menuBlack.findChildByName("stand").addAction(function (obj) {
            blackJack.dealerAction(mainMenu.obj)
            menuBlack.findChildByName("new").removeChildByName("takeCard")
            menuBlack.findChildByName("new").removeChildByName("stand")
            menuBlack.findChildByName("new").removeChildByName("save")
            logger.add(mainMenu.obj)
        })
    }
    if (menuBlack.findChildByName("save") === null) {
        menuBlack.findChildByName("new").addChild(new menuItem(
            "save",
            "Сохранить игру"
        ))
    }
    // TODO: AddAction->Save
})
menuBlack.findChildByName("playGame").addChild(new menuItem(
    "continue",
    "Продолжить игру"
))
menuBlack.findChildByName("playGame").addChild(new menuItem(
    "load",
    "Загрузить сохраненную игру"
))
// Добавляем опции
menuBlack.findChildByName("options").addChild(new menuItem(
    "deckType",
    "Тип колоды",
    "Выберите тип колоды",
    function (obj) {
        log(obj.deckType)
        return (obj.deckType) ? "(сейчас 52 карты)" : "(сейчас 36 карт)"
    }))
menuBlack.findChildByName("options").addChild(new menuItem(
    "deckFlush",
    "Замена колоды",
    "Выберите когда меняем колоду",
    function (obj) {
        return (obj.deckFlush) ? "(сейчас после каждой партии)" : "(сейчас по окончанию колоды)"
    }))
menuBlack.findChildByName("options").addChild(new menuItem(
    "difficulty",
    "Уровень сложности",
    "Выберите уровень сложности",
    function (obj) {
        switch (obj.difficulty) {
            case 1:
                return "(сейчас простой)"
            case 2:
                return "(сейчас сложный)"
            case 3:
                return "(сейчас вы играете с жуликом)"
        }
    }))
menuBlack.findChildByName("options").addChild(new menuItem(
    "current",
    "Показать текущие опции"
))
menuBlack.findChildByName("current").addAction(function (obj) {
    log(obj.deckType)
    let deck = (obj.deckType) ? "52 карты" : "36 карт"
    let flush = (obj.deckFlush) ? "После каждой партии" : "По окончанию колоды"
    let diff = ""
    switch (obj.difficulty) {
        case 1:
            diff = "Простой"
            break
        case 2:
            diff = "Сложный"
            break
        case 3:
            diff = "Жулик!"
    }
    let current = chalk.blueBright("Тип колоды: ") + chalk.greenBright(deck) + "\n" +
        chalk.blueBright("Смена колоды: ") + chalk.greenBright(flush) + "\n" +
        chalk.blueBright("Уровень сложности: ") + chalk.greenBright(diff)
    log(current)
})
// Добавляем Опции->Тип колоды
menuBlack.findChildByName("deckType").addChild(new menuItem(
    "setFull",
    "Полная (52 карты)"
))
menuBlack.findChildByName("setFull").addAction(function (obj) {
    obj.deckType = true
})
menuBlack.findChildByName("deckType").addChild(new menuItem(
    "setShort",
    "Обычная (36 карт)"
))
menuBlack.findChildByName("setShort").addAction(function (obj) {
    obj.deckType = false
})
// Добавляем Опции->Смена колоды
menuBlack.findChildByName("deckFlush").addChild(new menuItem(
    "eachGame",
    "После каждой партии"
))
menuBlack.findChildByName("eachGame").addAction(function (obj) {
    obj.deckFlush = true
})
menuBlack.findChildByName("deckFlush").addChild(new menuItem(
    "emptyDeck",
    "Когда в этой закончатся карты"
))
menuBlack.findChildByName("emptyDeck").addAction(function (obj) {
    obj.deckFlush = false
})
// Добавляем Опции->Уровень сложности
menuBlack.findChildByName("difficulty").addChild(new menuItem(
    "setNovice",
    "Простой (крупье добирает до 21 или перебора)"
))
menuBlack.findChildByName("setNovice").addAction(function (obj) {
    obj.difficulty = 1
})
menuBlack.findChildByName("difficulty").addChild(new menuItem(
    "setHard",
    "Сложный (крупье анализирует необходимость добора карты)"
))
menuBlack.findChildByName("setHard").addAction(function (obj) {
    obj.difficulty = 2
})
menuBlack.findChildByName("difficulty").addChild(new menuItem(
    "setCheater",
    "Жулик! (крупье видит следующую карту)"
))
menuBlack.findChildByName("setCheater").addAction(function (obj) {
    obj.difficulty = 3
})
//------------------------------
//------------------------------

//------------------------------
//    mainMenu.handle()
*/