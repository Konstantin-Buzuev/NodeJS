const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log

function repeat(count, symbol) {
  let result = ""
  for (let i = 0; i < count; i++) result += symbol
  return result
}

class Coin {
  constructor(_canRib = false) {
    this.canRib = _canRib //Может ли вставать на ребро
  }
  throw () {
    let result = Math.random()
    if (this.canRib && (0.99 <= result || result <= 0.01)) return "Ребро"
    result = Math.round(result)
    return result ? "Орёл" : "Решка"
  }
  setRib(_canRib) {
    this.canRib = _canRib
  }
}

module.exports = class HeadsAndTails {
  constructor(options) {
    /*Objects*/
    this.coin = new Coin()
    this.choiceSide = undefined
    this.gameOver = false
    this.gameResult = 0
    /*Options*/
    if (options.canRib != undefined) this.coin.setRib(options.canRib)
  }
  _quit() {
    log(chalk.yellowBright("Спасибо за игру! Заходите ещё!"))
  }
  newGame() {
    this.gameOver = false
    this.gameResult = 0
  }
  chooseSide(side) {
    this.choiceSide = side
  }
  makeTurn(user) {
    let winSide = this.coin.throw()
    log(chalk.greenBright(`Бросаю монету! Результат - ${winSide}`))
    if (this.choiceSide === winSide) {
      log(chalk.yellowBright("Поздравляем! Вы угадали!"))
      this.gameResult = 2
    } else {
      log(chalk.grey("Сожалею, но вы не угадали."))
      log(chalk.grey("Вам обязательно повезет в следующий раз!"))
      this.gameResult = 0
    }
    user.result = this.gameResult
  }
  setRib(_canRib) {
    this.coin.setRib(_canRib)
  }
}