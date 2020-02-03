module.exports = class Record {
    constructor(name = null, game = null, res = null) {
        this.user = name
        this.game = game
        this.result = res
    }
}