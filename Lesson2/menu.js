const chalk = require("chalk")
const inquirer = require("inquirer")
const Record = require("./record")

const log = console.log

function repeat(count, symbol) {
    let result = ""
    for (let i = 0; i < count; i++) result += symbol
    return result
}

class MenuItem {
    constructor(_name, _title, _message = "", _messageModifer = null, _obj = null, _parent = null, _action = null, _quit = null) {
        this.name = String(_name) // Внутреннее имя пункта меню (например, options)
        this.title = String(_title) // Название пункта меню (например, "Опции")
        this.message = String(_message) // Сообщение, выводимое при выборе пункта меню (например, "Выберите ваши действия")
        this.messageModifer = _messageModifer // Функция, возвращающая строку, добавляемую в сообщение в зависимости от свойств obj
        this.parent = Object(_parent) // menuItem - родитель, чтобы знать куда возвращаться
        this.action = _action // Функция, выполняемая в объекте при выборе этого пункта меню (задается только для листьев)
        this.obj = _obj // Object (BlackJack, Head&Tails, etc.)
        this.childs = [] // menuItem - подпункты меню
        this.quit = _quit // Функция, выполняемая при выходе из меню
    }
    addChild(_item) {
        this.childs.push(_item)
        _item.parent = this
        if (_item.obj === null) _item.obj = this.obj
    }
    removeChild(item) {
        this.childs.splice(this.childs.indexOf(item), 1)
    }
    haveChilds() {
        return (this.childs.length > 0) ? true : false
    }
    removeChildByName(name) {
        let child = this.childs.find(el => el.name === name)
        this.removeChild(child)
    }
    findChild(item) {
        return this.childs[this.childs.indexOf(item)]
    }
    _treeCrawl(name) {
        let item = null
        if (this.name === name) return this
        for (let i = 0, length = this.childs.length; i < length && item == null; i++) {
            if (this.childs[i].name === name) return this.childs[i] // Один из детей является искомым (поиск в ширину)
            else item = this.childs[i]._treeCrawl(name) // Рекурсия, опускаемся в глубину на один уровень
        }
        return item
    }
    _getRoot() {
        return (this.parent !== this) ? this.parent._getRoot() : this
    }
    findChildByName(name) {
        let root = this._getRoot()
        return root._treeCrawl(name)
    }
    setRoot() {
        this.parent = this
    }
    setQuit(func) {
        this.quit = func
    }
    addAction(action) {
        this.action = action
    }
    subMenu() {
        let questions = []
        let modifer = (this.messageModifer !== null) ? this.messageModifer(this.obj) : ""
        let subMenu = {
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright(`${this.message}${modifer}:`),
            choices: []
        }
        subMenu.choices.push(new inquirer.Separator(chalk.grey(repeat(30, "-"))))
        this.childs.forEach(item => {
            let answerOption = {
                name: chalk.greenBright(item.title),
                value: item.name
            }
            subMenu.choices.push(answerOption)
        })
        let BackOption = {
            name: chalk.red((this.parent === this) ? "Выход" : `Вернуться в ${this.parent.title}`),
            value: (this.parent === this) ? "quit" : this.parent.name
        }
        subMenu.choices.push(BackOption)
        questions.push(subMenu)
        return questions
    }
    handle() // handler of Menu items
    {
        inquirer.prompt(this.subMenu()).then(answer => {
            if (answer.choice === "quit") {
                if (this.quit !== null) this.quit()
            } else {
                let chosenItem = this.findChildByName(answer.choice)
                console.clear()
                if (chosenItem.action !== null) chosenItem.action(chosenItem.obj)
                if (chosenItem.haveChilds()) chosenItem.handle()
                else chosenItem.parent.handle()
            }
        })
    }
}
module.exports = class Menu {
    constructor(user, blackJack, headNTails, logger) {
        this.headNTails = headNTails
        this.menu = new MenuItem(
            "main",
            "Главное меню",
            chalk.yellowBright(`Добро пожаловать в наше казино, ${user}!`),
            null,
            new Record(user, "", ""))
        this.menu.setRoot()
        this.menu.setQuit(() => {
            log(chalk.yellowBright(`Спасибо за игру в нашем казино, ${user}! Заходите ещё!`))
        })
        this.menu.addChild(new MenuItem(
            "blackJack",
            'Сыграть в "Блэкджек"',
            "Выберите ваши действия",
            null,
            blackJack
        ))
        this.menu.findChildByName("blackJack").addAction(() => {
            this.menu.obj.game = "BlackJack"
        })
        // Добавляем меню игры Блэкджек
        let menuBlack = this.menu.findChildByName("blackJack")
        menuBlack.addChild(new MenuItem(
            "new",
            "Новая игра",
            "Что скажете крупье?"
        ))
        menuBlack.findChildByName("new").addAction(() => {
            blackJack.newGame()
            if (menuBlack.findChildByName("takeCard") === null) {
                menuBlack.findChildByName("new").addChild(new MenuItem(
                    "takeCard",
                    "Карту!"
                ))
                menuBlack.findChildByName("takeCard").addAction(() => {
                    blackJack.playerAction(this.menu.obj)
                    if (blackJack.gameOver) {
                        menuBlack.findChildByName("new").removeChildByName("takeCard")
                        menuBlack.findChildByName("new").removeChildByName("stand")
                        menuBlack.findChildByName("new").removeChildByName("save")
                        logger.add(this.menu.obj)
                        logger.save()
                    }
                })
            }
            if (menuBlack.findChildByName("stand") === null) {
                menuBlack.findChildByName("new").addChild(new MenuItem(
                    "stand",
                    "Себе!"
                ))
                menuBlack.findChildByName("stand").addAction(() => {
                    blackJack.dealerAction(this.menu.obj)
                    menuBlack.findChildByName("new").removeChildByName("takeCard")
                    menuBlack.findChildByName("new").removeChildByName("stand")
                    menuBlack.findChildByName("new").removeChildByName("save")
                    logger.add(this.menu.obj)
                    logger.save()
                })
            }
        })
        menuBlack.addChild(new MenuItem( // присвоение родителя в самом методе addChild
            "options",
            "Опции",
            "Выберите опцию"))
        // Добавляем опции
        menuBlack.findChildByName("options").addChild(new MenuItem(
            "deckType",
            "Тип колоды",
            "Выберите тип колоды",
            function (obj) {
                return (obj.deckType) ? "(сейчас 52 карты)" : "(сейчас 36 карт)"
            }))
        menuBlack.findChildByName("options").addChild(new MenuItem(
            "deckFlush",
            "Замена колоды",
            "Выберите когда меняем колоду",
            function (obj) {
                return (obj.deckFlush) ? "(сейчас после каждой партии)" : "(сейчас по окончанию колоды)"
            }))
        menuBlack.findChildByName("options").addChild(new MenuItem(
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
        menuBlack.findChildByName("options").addChild(new MenuItem(
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
        menuBlack.findChildByName("deckType").addChild(new MenuItem(
            "setFull",
            "Полная (52 карты)"
        ))
        menuBlack.findChildByName("setFull").addAction(function (obj) {
            obj.deckType = true
        })
        menuBlack.findChildByName("deckType").addChild(new MenuItem(
            "setShort",
            "Обычная (36 карт)"
        ))
        menuBlack.findChildByName("setShort").addAction(function (obj) {
            obj.deckType = false
        })
        // Добавляем Опции->Смена колоды
        menuBlack.findChildByName("deckFlush").addChild(new MenuItem(
            "eachGame",
            "После каждой партии"
        ))
        menuBlack.findChildByName("eachGame").addAction(function (obj) {
            obj.deckFlush = true
        })
        menuBlack.findChildByName("deckFlush").addChild(new MenuItem(
            "emptyDeck",
            "Когда в этой закончатся карты"
        ))
        menuBlack.findChildByName("emptyDeck").addAction(function (obj) {
            obj.deckFlush = false
        })
        // Добавляем Опции->Уровень сложности
        menuBlack.findChildByName("difficulty").addChild(new MenuItem(
            "setNovice",
            "Простой (крупье добирает до 21 или перебора)"
        ))
        menuBlack.findChildByName("setNovice").addAction(function (obj) {
            obj.difficulty = 1
        })
        menuBlack.findChildByName("difficulty").addChild(new MenuItem(
            "setHard",
            "Сложный (крупье анализирует необходимость добора карты)"
        ))
        menuBlack.findChildByName("setHard").addAction(function (obj) {
            obj.difficulty = 2
        })
        menuBlack.findChildByName("difficulty").addChild(new MenuItem(
            "setCheater",
            "Жулик! (крупье видит следующую карту)"
        ))
        menuBlack.findChildByName("setCheater").addAction(function (obj) {
            obj.difficulty = 3
        })
        // Добавляем меню "Орел и решка"
        this.menu.addChild(new MenuItem(
            "Heads & Tails",
            'Сыграть в "Орёл и решка"',
            "Выберите ваши действия",
            null,
            headNTails
        ))
        this.menu.findChildByName("Heads & Tails").addAction(() => {
            this.menu.obj.game = "Heads & Tails"
        })
        let menuTails = this.menu.findChildByName("Heads & Tails")
        menuTails.addChild(new MenuItem(
            "newTails",
            "Новая игра",
            "Какую сторону монеты загадываете?"
        ))
        menuTails.findChildByName("newTails").addAction(() => {
            headNTails.newGame()
            if (menuTails.findChildByName("Head") === null) {
                menuTails.findChildByName("newTails").addChild(new MenuItem(
                    "Head",
                    "Орёл"
                ))
                menuTails.findChildByName("Head").addAction(() => {
                    this.HnTaction("Орёл", headNTails, logger, menuTails)
                })
            }
            if (menuTails.findChildByName("Tail") === null) {
                menuTails.findChildByName("newTails").addChild(new MenuItem(
                    "Tail",
                    "Решка"
                ))
                menuTails.findChildByName("Tail").addAction(() => {
                    this.HnTaction("Решка", headNTails, logger, menuTails)
                })
            }
        })
        // Добавляем опции для игры "Орёл и решка"
        menuTails.addChild(new MenuItem(
            "optionsTail",
            "Опции",
            "Может ли монета встать на ребро?",
            () => {
                return (this.headNTails.coin.canRib) ? "(сейчас может)" : "(сейчас не может)"
            }))
        menuTails.findChildByName("optionsTail").addChild(new MenuItem(
            "canRib",
            "Может"
        ))
        menuTails.findChildByName("canRib").addAction(() => {
            this.headNTails.setRib(true)
        })
        menuTails.findChildByName("optionsTail").addChild(new MenuItem(
            "cannotRib",
            "Не может"
        ))
        menuTails.findChildByName("cannotRib").addAction(() => {
            this.headNTails.setRib(false)
        })
        // Добавляем статистику
        this.menu.addChild(new MenuItem(
            "stats",
            "Показать статистику",
            "Выше показаны Ваши результаты"
        ))
        this.menu.findChildByName("stats").addAction(() => {
            let stats = logger.getStats(user)
            let current = ""
            for (let i = 1; i < stats.length; i++) {
                current += chalk.blueBright("Игра: ") + chalk.greenBright(stats[i].name) + "\n" +
                    chalk.blueBright("Побед: ") + chalk.greenBright(stats[i].wins) + "\n" +
                    chalk.blueBright("Поражений: ") + chalk.greenBright(stats[i].defeats) + "\n" +
                    chalk.blueBright("Ничьих: ") + chalk.greenBright(stats[i].drew) + "\n" +
                    chalk.blueBright("Наибольшая серия побед: ") + chalk.greenBright(stats[i].maxWinSerie) + "\n" +
                    chalk.blueBright("Наибольшая серия поражений: ") + chalk.greenBright(stats[i].maxDefeatSerie) + "\n" +
                    chalk.blueBright("Наибольшая серия ничьих: ") + chalk.greenBright(stats[i].maxDrawSerie) + "\n"
            }
            log(current)
        })

    }
    HnTaction(side, headNTails, logger, menuTails) {
        headNTails.chooseSide(side)
        headNTails.makeTurn(this.menu.obj)
        logger.add(new Record(this.menu.obj.user, this.menu.obj.game, this.menu.obj.result))
        logger.save()
        menuTails.findChildByName("newTails").removeChildByName("Head")
        menuTails.findChildByName("newTails").removeChildByName("Tail")
    }
}