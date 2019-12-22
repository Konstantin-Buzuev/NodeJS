const chalk = require("chalk");
const beeper = require("beeper");
const log = console.log;
log(chalk.green("Hello there!"));
log(chalk.green.bgGrey.bold("I'm a new script!"));
beeper("*---**---*--**");
