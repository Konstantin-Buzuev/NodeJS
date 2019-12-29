const chalk = require("chalk");
const inquirer = require("inquirer");
const log = console.log;

function repeat(count, symbol) {
  let result = "";
  for (let i = 0; i < count; i++) result += symbol;
  return result;
}

class Coin {
  constructor() {}
  throw () {
    let result = Math.round(Math.random());
    return result ? "Орёл" : "Решка";
  }
}

class HeadsAndTails {
  constructor() {
    this.guess = "";
    this.throw = "";
    this.endGame = false;
    this.coin = new Coin();
    this.mainMenu = [{
      type: "rawlist",
      name: "mainMenu",
      message: chalk.blueBright("Выберите ваши действия:"),
      choices: [
        new inquirer.Separator(chalk.grey(repeat(30, "-"))),
        {
          name: chalk.greenBright("Сыграть"),
          value: 1
        },
        {
          name: chalk.red("Выйти"),
          value: 2
        }
      ]
    }];
    this.playGame = [{
      type: "rawlist",
      name: "side",
      message: chalk.blueBright("Загадайте сторону монеты"),
      choices: [
        new inquirer.Separator(chalk.grey(repeat(30, "-"))),
        {
          name: chalk.greenBright("Орёл"),
          value: "Орёл"
        },
        {
          name: chalk.greenBright("Решка"),
          value: "Решка"
        }
      ]
    }];
    this.continueGame = [{
      type: "confirm",
      name: "continueGame",
      message: chalk.blueBright("Хотите продолжить игру?")
    }];
    log(chalk.yellow.bgGreenBright('Добро пожаловать в игру "Орел и Решка"!'));
    this._mainMenu();
  }
  _quit() {
    this.endGame = true;
    log(chalk.yellowBright("Спасибо за игру! Заходите ещё!"));
  }
  _makeTurn() {
    return inquirer.prompt(this.playGame).then(choice => {
      let winSide = this.coin.throw();
      log(chalk.greenBright(`Бросаю монету! Результат - ${winSide}`));
      if (choice.side === winSide) log(chalk.yellowBright("Поздравляем! Вы угадали!"));
      else {
        log(chalk.grey("Сожалею, но вы не угадали."));
        log(chalk.grey("Вам обязательно повезет в следующий раз!"));
      }
    });
  }
  _playGame() {
    this._makeTurn()
      .then(() => inquirer.prompt(this.continueGame).then(answer => {
        if (answer.continueGame === true) this._playGame();
        else this._mainMenu();
      }));
  }
  _mainMenu() {
    inquirer.prompt(this.mainMenu).then(answers => {
      if (answers.mainMenu === 1) this._playGame();
      if (answers.mainMenu === 2) this._quit();
    });
  }
}
let headNtails = new HeadsAndTails();

/*
const Cardsuits = Enum`
	    CLUBS трефы
	    DIAMONDS бубны
	    HEARTS червы
	    SPADES пики
	`;
*/