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

module.exports = class BlackJack {
    constructor(options) {
        //Objects
        this.deck = new Deck(false) // Короткая колода
        if (options.isFull != undefined) this.deck.takeNewDeck(options.isFull)
        this.player = new Hand()
        this.dealer = new Hand()
        //Options
        this.isFull = options.isFull // 36 или 52 карты
        this.flush = options.flush // Замена колоды после каждой раздачи
        // Messages

    }
}