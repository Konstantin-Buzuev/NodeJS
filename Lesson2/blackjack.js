const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log

function repeat(count, symbol) {
    let result = ""
    for (let i = 0; i < count; i++) result += symbol
    return result
}

const suits = ["♠", "♣", "♦", "♥"]
const suitNames = ["Пики", "Трефы", "Бубны", "Червы"]
const advantages = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "В", "Д", "К", "Т"]

class Card {
    constructor(_suit, _advantage) {
        this.suit = _suit //String
        this.advantage = _advantage //String
        this._setIcon()
        this._setValue()
    }
    _setIcon() {
        let suit = 0;
        switch (this.suit) {
            case 'Пик':
            case 'Пики':
                suit = 0
                break
            case 'Треф':
            case 'Трефы':
                suit = 1
                break
            case 'Бубен':
            case 'Бубны':
                suit = 2
                break
            case 'Червей':
            case 'Черви':
                suit = 3
                break
        }
        this.icon = suits[suit]
        this.icon += this.advantage
    }
    _setValue() {
        if (+this.advantage) {
            this.value = this.advantage
            return
        }
        switch (this.advantage) {
            case 'В':
                this.value = 2
                break
            case 'Д':
                this.value = 3
                break
            case 'К':
                this.value = 4
                break
            case 'Т':
                this.value = 11
                break
        }
    }
}

class Deck {
    constructor(isFull = true) {
        this.cards = []
        this.takeNewDeck(isFull)
    }
    takeNewDeck(isFull) {
        this.cards = []
        for (let j = 0; j < suitNames.length; j++) {
            for (let i = (isFull) ? 0 : 4 /* 52 карты или 36(false)*/ ; i < advantages.length; i++) this.cards.push(new Card(suitNames[j], advantages[i]))
        }
        this.ShuffleDeck()
    }
    ShuffleDeck() {
        let shuffledCards = []
        while (this.cards.length) {
            let index = Math.round(Math.random() * (this.cards.length - 1))
            shuffledCards.push(this.cards[index])
            this.cards.splice(index, 1)
        }
        this.cards = shuffledCards
    }
    takeCard() {
        let card = this.cards[0]
        this.cards.splice(0, 1)
        return card
    }
}
let deck = new Deck(false)

class Hand {
    constructor(deck) {
        this.deck = deck
        this.cards = []
        this.advantage = 0
        this.isBusted = false
    }
    takeCard() {
        let card = this.deck.takeCard()
        this.cards.push(card)
        this.advantage += card.value
        if (this.advantage > 21) this.isBusted = true
    }
    flush() {
        this.cards = []
        this.advantage = 0
        this.isBusted = false
    }
    takeDeck(deck) {
        this.deck = deck
    }
    getCards() {
        return this.cards
    }
}

class BlackJack {
    constructor(options) {
        //Objects
        this.deck = new Deck(false) // Короткая колода
        if (options.isFull != undefined) this.deck.takeNewDeck(options.isFull)
        this.player = new Hand()
        this.dealer = new Hand()
        //Options
        this.isFull = options.isFull // 36 или 52 карты
        this.flush = options.flush // Замена колоды после каждой раздачи
        this.difficulty = options.difficulty // Уровень сложности (1-3)
        // Какое меню отображаем
        this.questions = {
            mainMenu: this.mainMenu,
            setup: this.setup,
            optionIsFull: this.optionIsFull,
            setFull: this.setup,
            setShort: this.setup,
            optionFlush: this.optionFlush,
            setFlush: this.setup,
            setNotFlush: this.setup,
            optionDifficulty: this.optionDifficulty,
            setNovice: this.setup,
            setHard: this.setup,
            setCheater: this.setup,
            optionCurrent: this.optionCurrent,
            quit: null
        }
        // Какие действия делаем перед отображением меню
        this.actions = {
            mainMenu: null,
            setup: null,
            optionIsFull: null,
            setFull: function (obj) {
                obj.isFull = true;
            },
            setShort: function (obj) {
                obj.isFull = false;
            },
            optionFlush: null,
            setFlush: function (obj) {
                obj.flush = true;
            },
            setNotFlush: function (obj) {
                obj.flush = false
            },
            optionDifficulty: null,
            setNovice: function (obj) {
                obj.difficulty = 1;
            },
            setHard: function (obj) {
                obj.difficulty = 2;
            },
            setCheater: function (obj) {
                obj.difficulty = 3;
            },
            optionCurrent: null,
            quit: function (obj) {
                console.log("!")
            }
        }
    }
    handle(action) {
        console.clear()
        if (this.actions[action] !== null) this.actions[action](this)
        if (this.questions[action] !== null) {
            inquirer.prompt(this.questions[action](this)).then(answer => {
                this.handle(answer.choice)
            })
        }
    }
    mainMenu() {
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright("Выберите ваши действия:"),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.greenBright("Сыграть"),
                    value: "playGame"
                },
                {
                    name: chalk.greenBright("Опции"),
                    value: "setup"
                },
                {
                    name: chalk.red("Выйти"),
                    value: "quit"
                }
            ]
        }]
    }
    setup() {
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright("Выберите опцию:"),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.greenBright("Тип колоды"),
                    value: "optionIsFull"
                },
                {
                    name: chalk.greenBright("Замена колоды"),
                    value: "optionFlush"
                },
                {
                    name: chalk.greenBright("Уровень сложности"),
                    value: "optionDifficulty"
                },
                {
                    name: chalk.green("Показать текущие опции"),
                    value: "optionCurrent"
                },
                {
                    name: chalk.red("Возврат в основное меню"),
                    value: "mainMenu"
                }
            ]
        }]
    }
    optionIsFull(obj) {
        let now = (obj.isFull) ? "(сейчас 54 карты)" : "(сейчас 36 карт)"
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright(`Выберите тип колоды${now}:`),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.greenBright("Полная (52 карты)"),
                    value: "setFull"
                },
                {
                    name: chalk.greenBright("Обычная (36 карт)"),
                    value: "setShort"
                },
                {
                    name: chalk.red("Вернутся в опции"),
                    value: "setup"
                }
            ]
        }]
        return QoptionIsFull
    }
    optionFlush(obj) {
        let now = (obj.flush) ? "(сейчас после каждой партии)" : "(сейчас по окончанию колоды)"
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright(`Выберите когда меняем колоду${now}:`),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.greenBright("После каждой партии"),
                    value: "setFlush"
                },
                {
                    name: chalk.greenBright("Когда в этой закончатся карты"),
                    value: "setNotFlush"
                },
                {
                    name: chalk.red("Вернутся в опции"),
                    value: "setup"
                }
            ]

        }]
    }
    optionDifficulty(obj) {
        let now = ""
        switch (obj.difficulty) {
            case 1:
                now = "(сейчас простой)"
                break
            case 2:
                now = "(сейчас сложный)"
                break
            case 3:
                now = "(сейчас вы играете с жуликом)"
                break
        }
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright(`Выберите уровень сложности${now}:`),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.greenBright("Простой (крупье добирает до 21 или перебора)"),
                    value: "setNovice"
                },
                {
                    name: chalk.greenBright("Сложный (крупье анализирует необходимость добора карты)"),
                    value: "setHard"
                },
                {
                    name: chalk.greenBright("Жулик! (крупье видит следующую карту)"),
                    value: "setCheater"
                },
                {
                    name: chalk.red("Вернутся в опции"),
                    value: "setup"
                }
            ]
        }]
    }
    optionCurrent(obj) {
        let deck = (obj.isFull) ? "54 карты" : "36 карт"
        let flush = (obj.flush) ? "После каждой партии" : "По окончанию колоды"
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
        return [{
            type: "rawlist",
            name: "choice",
            message: chalk.blueBright("Тип колоды: ") + chalk.greenBright(deck) + "\n" +
                chalk.blueBright("Смена колоды: ") + chalk.greenBright(flush) + "\n" +
                chalk.blueBright("Уровень сложности: ") + chalk.greenBright(diff),
            choices: [
                new inquirer.Separator(chalk.grey(repeat(30, "-"))),
                {
                    name: chalk.red("Вернутся в опции"),
                    value: "setup"
                }
            ]
        }]

    }
}


let options = {
    isFull: false,
    flush: false,
    difficulty: 1
}
let black = new BlackJack(options)
black.handle("mainMenu")