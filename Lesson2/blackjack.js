const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log
const menuItem = require("./menu")
const suits = ["♠", "♣", "♦", "♥"]
const suitNames = ["Пики", "Трефы", "Бубны", "Червы"]
const advantages = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "В", "Д", "К", "Т"]

function repeat(count, symbol) {
    let result = ""
    for (let i = 0; i < count; i++) result += symbol
    return result
}


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
                this.value = 10
                break
            case 'Д':
                this.value = 10
                break
            case 'К':
                this.value = 10
                break
            case 'Т':
                this.value = 1
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
        this.shuffleDeck()
    }
    shuffleDeck() {
        let shuffledCards = []
        while (this.cards.length) {
            let index = Math.round(Math.random() * (this.cards.length - 1))
            shuffledCards.push(this.cards[index])
            this.cards.splice(index, 1)
        }
        this.cards = shuffledCards
    }
    showDeck() {
        let deck = ""
        this.cards.forEach(card => {
            deck += card.icon
            deck += " "
        })
        return deck
    }
    takeCard() {
        let card = this.cards[0]
        this.cards.splice(0, 1)
        return card
    }
    isEmpty() {
        return (this.cards.length === 0) ? true : false
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
        if (+card.value === 1 && this.advantage < 11) this.advantage += 10 //Туз при сумме меньше 11
        this.advantage += +card.value
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
    getHandIcon() {
        let hand = ""
        this.cards.forEach(card => {
            hand += card.icon
            hand += " "
        })
        return hand
    }
}
module.exports = class BlackJack {
    constructor(options) {
        //Objects
        this.deck = (options.deckType !== undefined) ? new Deck(options.deckType) : new Deck(false)
        this.player = new Hand(this.deck)
        this.dealer = new Hand(this.deck)
        //Options
        this.deckType = (options.deckType !== undefined) ? options.deckType : false // 52 или 36 карт
        this.deckFlush = (options.deckFlush !== undefined) ? options.deckFlush : false // Замена колоды после каждой раздачи
        this.difficulty = (options.difficulty !== undefined) ? options.difficulty : 1 // Уровень сложности (1-3)
        //Properties
        this.gameOver = false
        this.gameResult = 0 // 0 - player lose, 1 - deuce, 2 - player wins
    }
    newGame() {
        if (this.gameOver) {
            this.player.flush()
            this.dealer.flush()
            if (this.deckFlush) this.deck.takeNewDeck(this.deckType)
            this.deck.shuffleDeck()
            this.playerWins = false
            this.gameOver = false
        } else {
            log(chalk.blueBright("Ваша рука:") + chalk.whiteBright(this.player.getHandIcon()))
            log(chalk.blueBright("Ваши очки:") + chalk.greenBright(this.player.advantage))
        }
    }
    _playerHandLog(player, isPlayer) {
        let handString = (isPlayer) ? "Ваша рука:" : "Рука крупье:"
        let advantageString = (isPlayer) ? "Ваши очки:" : "Очки крупье:"
        log(chalk.blueBright(handString) + chalk.whiteBright(player.getHandIcon()) + " " + chalk.blueBright(advantageString) + chalk.greenBright(player.advantage))
    }
    _dealerNeedCard(difficulty) {
        let result = false
        if (this.dealer.advantage > this.player.advantage) return false // Крупье выйграл
        switch (difficulty) {
            case 1:
                if (this.dealer.advantage < this.player.advantage) result = true
                break
            case 2:
                let cards = this.dealer.deck.cards
                let winPossibility = 0
                cards.forEach(card => {
                    let newAdvantage = +card.value
                    newAdvantage += +this.dealer.advantage
                    if (newAdvantage <= 21) winPossibility += 1 / cards.length
                })
                if (winPossibility > 0.5) result = true
                break
            case 3:
                let newAdvantage = +this.dealer.advantage
                newAdvantage += +this.dealer.deck.cards[0].value
                if (newAdvantage <= 21) result = true
                break
        }
        return result
    }
    _gameIsFinished(player) {
        return (player.isBusted || player.advantage === 21) ? true : false
    }
    playerAction(user) {
        this.player.takeCard()
        log(chalk.blueBright("Вы берете карту:") + chalk.whiteBright(this.player.cards[this.player.cards.length - 1].icon))
        this._playerHandLog(this.player, true)
        if (this._gameIsFinished(this.player)) this._winnerDetermination(user)
        else if (this.deck.isEmpty()) this.deck.takeNewDeck(this.deckType)
    }
    dealerAction(user) {
        while (this._dealerNeedCard(this.difficulty) && !this._gameIsFinished(this.dealer)) {
            this.dealer.takeCard()
            log(chalk.blueBright("Крупье берет карту:") + chalk.whiteBright(this.dealer.cards[this.dealer.cards.length - 1].icon))
            this._playerHandLog(this.dealer, false)
            if (this.deck.isEmpty()) this.deck.takeNewDeck(this.deckType)
        }
        log(chalk.grey(repeat(30, "-")))
        this._playerHandLog(this.player, true)
        this._winnerDetermination(user)
    }
    _isBustedCase() {
        if (this.dealer.isBusted === false && this.player.isBusted === false) return false
        if (this.dealer.isBusted) this.gameResult = 2
        if (this.player.isBusted) this.gameResult = 0
        return true
    }
    _isBlackJackCase() {
        if (this.dealer.advantage !== 21 && this.dealer.advantage !== 21) return false
        if (this.dealer.advantage === 21) this.gameResult = 0
        if (this.player.advantage === 21) this.gameResult = 2
        return true
    }
    _winnerDetermination(user) {
        if (this._isBustedCase() === false && this._isBlackJackCase() === false) {
            if (this.player.advantage < this.dealer.advantage) this.gameResult = 0
            if (this.player.advantage === this.dealer.advantage) this.gameResult = 1
            if (this.player.advantage > this.dealer.advantage) this.gameResult = 2
        }

        switch (this.gameResult) {
            case 0:
                log(chalk.grey("Сожалееем, но вы проиграли... :( "))
                break
            case 1:
                log(chalk.blueBright("Ничья! Попробуйте еще раз!"))
                break
            case 2:
                log(chalk.yellowBright("Поздравляем! Вы победили!"))
                break
        }
        this.gameOver = true
        user.result = this.gameResult
    }
}