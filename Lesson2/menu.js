const chalk = require("chalk")
const inquirer = require("inquirer")
const log = console.log

function repeat(count, symbol) {
    let result = ""
    for (let i = 0; i < count; i++) result += symbol
    return result
}

module.exports = class menuItem {
    constructor(_name, _title, _message = "", _obj = null, _messageModifer = null, _parent = null, _action = null) {
        this.name = _name //String - внутреннее имя пункта меню (например, options)
        this.title = _title //String - название пункта меню (например, "Опции")
        this.message = _message //String - сообщение, выводимое при выборе пункта меню (например, "Выберите ваши действия")
        this.messageModifer = _messageModifer // Function функция, возвращающая строку, добавляемую в сообщение в зависимости от свойств obj
        this.parent = _parent // menuItem - родитель, чтобы знать куда возвращаться
        this.action = _action // function on object - функция, выполняемая в объекте при выборе этого пункта меню (задается только для листьев)
        this.obj = _obj // Object (BlackJack, Head&Tails, etc.) - надо ВЫПИЛИТЬ
        this.childs = [] // menuItem - подпункты меню
    }
    addChild(_item) {
        this.childs.push(_item)
        _item.parent = this
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
    addAction(action, obj) {
        this.action = action
        this.obj = obj
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
            if (answer.choice === "quit") this.obj.quit()
            else {
                let chosenItem = this.findChildByName(answer.choice)
                console.clear()
                if (chosenItem.action !== null) chosenItem.action(chosenItem.obj)
                if (chosenItem.haveChilds()) chosenItem.handle()
                else chosenItem.parent.handle()
            }
        })
    }
}