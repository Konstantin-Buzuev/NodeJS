const fs = require("fs")
const log = console.log

module.exports = class Record {
    constructor(name = null, game = null, res = null) {
        this.user = name
        this.game = game
        this.result = res
    }
}

class GameStats {
    constructor(gameName) {
        this.name = gameName
        this.wins = 0
        this.defeats = 0
        this.drew = 0
        this.currentWinSerie = 0
        this.currentDefeatSerie = 0
        this.currentDrawSerie = 0
        this.maxWinSerie = 0
        this.maxDefeatSerie = 0
        this.maxDrawSerie = 0
    }
    win() {
        this.wins++
        this.maxWinSerie = (++this.currentWinSerie > this.maxWinSerie) ? this.currentWinSerie : this.maxWinSerie
        this.currentDrawSerie = 0
        this.currentDefeatSerie = 0
    }
    draw() {
        this.drew++
        this.maxDrawSerie = (++this.currentDrawSerie > this.maxDrawSerie) ? this.currentDrawSerie : this.maxDrawSerie
        this.currentWinSerie = 0
        this.currentDefeatSerie = 0
    }
    defeat() {
        this.defeats++
        this.maxDefeatSerie = (++this.currentDefeatSerie > this.maxDefeatSerie) ? this.currentDefeatSerie : this.maxDefeatSerie
        this.currentDrawSerie = 0
        this.currentWinSerie = 0
    }
}

module.exports = class Logger {
    constructor(path) {
        this.path = path
        this.log = []
        this.load()
    }
    load() {
        if (fs.existsSync(this.path)) fs.readFile(this.path, "utf-8", (err, data) => {
            if (err) {
                throw err
                this.log = []
            } else {
                this.log = JSON.parse(data.toString())
            }
        })
        else this.log = []
    }
    save() {
        let output = JSON.stringify(this.log, null, 2)
        fs.writeFile(this.path, output, (err) => {
            if (err) throw err
        })
    }
    add(obj) {
        this.log.push(obj)
    }
    getStats(name) {
        let statistics = []
        // Первый элемент - объект с именем пользователя!
        statistics.push({
            user: name
        })
        this.log.forEach(record => {
            // Просматриваем записи только о конкретном пользователе
            if (record.user === name) {
                // Проверка существования статистики по игре, запись о которой анализируем
                let game = statistics.find(el => el.name === record.game)
                if (game === undefined) {
                    statistics.push(new GameStats(record.game))
                    game = statistics[statistics.length - 1]
                }
                switch (+record.result) {
                    case 0:
                        game.defeat()
                        break
                    case 1:
                        game.draw()
                        break
                    case 2:
                        game.win()
                        break
                }
            }
        })
        return statistics
    }
}