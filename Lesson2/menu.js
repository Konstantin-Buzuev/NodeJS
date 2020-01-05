const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log

module.exports = function repeat(count, symbol) {
    let result = ""
    for (let i = 0; i < count; i++) result += symbol
    return result
}

module.exports = class menuItem {
    constructor(_name, _title, _message = "", _messageModifer = null, _obj = null, _parent = null, _action = null, _quit = null) {
        this.name = String(_name) // Внутреннее имя пункта меню (например, options)
        this.title = String(_title) // Название пункта меню (например, "Опции")
        this.message = String(_message) // Сообщение, выводимое при выборе пункта меню (например, "Выберите ваши действия")
        this.messageModifer = _messageModifer // Функция, возвращающая строку, добавляемую в сообщение в зависимости от свойств obj
        this.parent = Object(_parent) // menuItem - родитель, чтобы знать куда возвращаться
        this.action = _action // Функция, выполняемая в объекте при выборе этого пункта меню (задается только для листьев)
        this.obj = Object(_obj) // Object (BlackJack, Head&Tails, etc.)
        this.childs = [] // menuItem - подпункты меню
        this.quit = _quit // Функция, выполняемая при выходе из меню
    }
    addChild(_item) {
        this.childs.push(_item)
        _item.parent = this
        _item.obj = this.obj
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