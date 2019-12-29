const HeadsAndTails = require('./headsNtails')

let argv = require('minimist')(process.argv.slice(2), {
    alias: {
        canRib: 'r',
    }
})
let headsNtails = new HeadsAndTails(argv)