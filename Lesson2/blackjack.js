const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log
const menuItem = require("./menu")

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
        this.deck = (options.deckType !== undefined) ? new Deck(options.deckType) : new Deck(false)
        this.player = new Hand(this.deck)
        this.dealer = new Hand(this.deck)
        //Options
        this.deckType = (options.deckType !== undefined) ? options.deckType : false // 36 или 52 карты
        this.deckFlush = (options.deckFlush !== undefined) ? options.deckFlush : false // Замена колоды после каждой раздачи
        this.difficulty = (options.difficulty !== undefined) ? options.difficulty : 1 // Уровень сложности (1-3)
        // Какое меню отображаем
        this.menu = new menuItem("main",
            "Главное меню",
            "Выберите ваши действия",
            this) // messageModifer, parent, action = null по-умолчанию
        this.menu.setRoot()
        // Добавляем главное меню
        this.menu.addChild(new menuItem(
            "playGame",
            "Сыграть",
            "Выберите пункт меню"))
        this.menu.addChild(new menuItem( // присвоение родителя в самом методе addChild
            "options",
            "Опции",
            "Выберите опцию"))
        // Добавляем опции
        this.menu.findChildByName("options").addChild(new menuItem(
            "deckType",
            "Тип колоды",
            "Выберите тип колоды",
            this,
            function (obj) {
                return (obj.deckType) ? "(сейчас 52 карты)" : "(сейчас 36 карт)"
            }))
        this.menu.findChildByName("options").addChild(new menuItem(
            "deckFlush",
            "Замена колоды",
            "Выберите когда меняем колоду",
            this,
            function (obj) {
                return (obj.deckFlush) ? "(сейчас после каждой партии)" : "(сейчас по окончанию колоды)"
            }))
        this.menu.findChildByName("options").addChild(new menuItem(
            "difficulty",
            "Уровень сложности",
            "Выберите уровень сложности",
            this,
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
        this.menu.findChildByName("options").addChild(new menuItem(
            "current",
            "Показать текущие опции"
        ))
        this.menu.findChildByName("current").addAction(function (obj) {
                let deck = (obj.deckType) ? "54 карты" : "36 карт"
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
                return "current"
            },
            this)
        // Добавляем Опции->Тип колоды
        this.menu.findChildByName("deckType").addChild(new menuItem(
            "setFull",
            "Полная (52 карты)"
        ))
        this.menu.findChildByName("setFull").addAction(function (obj) {
            obj.deckType = true
        }, this)
        this.menu.findChildByName("deckType").addChild(new menuItem(
            "setShort",
            "Обычная (36 карт)"
        ))
        this.menu.findChildByName("setShort").addAction(function (obj) {
            obj.deckType = false
        }, this)
        // Добавляем Опции->Смена колоды
        this.menu.findChildByName("deckFlush").addChild(new menuItem(
            "eachGame",
            "После каждой партии"
        ))
        this.menu.findChildByName("eachGame").addAction(function (obj) {
            obj.deckFlush = true
        }, this)
        this.menu.findChildByName("deckFlush").addChild(new menuItem(
            "emptyDeck",
            "Когда в этой закончатся карты"
        ))
        this.menu.findChildByName("emptyDeck").addAction(function (obj) {
            obj.deckFlush = false
        }, this)
        // Добавляем Опции->Уровень сложности
        this.menu.findChildByName("difficulty").addChild(new menuItem(
            "setNovice",
            "Простой (крупье добирает до 21 или перебора)"
        ))
        this.menu.findChildByName("setNovice").addAction(function (obj) {
            obj.difficulty = 1
        }, this)
        this.menu.findChildByName("difficulty").addChild(new menuItem(
            "setHard",
            "Сложный (крупье анализирует необходимость добора карты)"
        ))
        this.menu.findChildByName("setHard").addAction(function (obj) {
            obj.difficulty = 2
        }, this)
        this.menu.findChildByName("difficulty").addChild(new menuItem(
            "setCheater",
            "Жулик! (крупье видит следующую карту)"
        ))
        this.menu.findChildByName("setCheater").addAction(function (obj) {
            obj.difficulty = 3
        }, this)
        // Добавляем выход
        this.quit = () => {
            log(chalk.yellowBright("Спасибо за игру! Заходите ещё!"))
        }
    }
}
let options = {
    deckType: false,
    deckFlush: false,
    difficulty: 1
}
let black = new BlackJack(options)
black.menu.handle()

/*
MENU
main+
    playGame+
        new TODO NEXT!
        load
        continue
        save
        *back+
    options+
        deck+
            full+
            short+
            *back+
        flush+
            eachGame+
            emptyDeck+
            *back+
        difficulty+
            novice+
            hard+
            cheater+
            *back+
        current+
        *back+
    *quit+
*/