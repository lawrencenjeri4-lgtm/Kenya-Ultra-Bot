const chalk = require("chalk");

function time() {
    return new Date().toLocaleTimeString();
}

module.exports = {

    info(text) {
        console.log(chalk.cyan(`[${time()}] INFO  ${text}`));
    },

    success(text) {
        console.log(chalk.green(`[${time()}] SUCCESS  ${text}`));
    },

    warn(text) {
        console.log(chalk.yellow(`[${time()}] WARN  ${text}`));
    },

    error(text) {
        console.log(chalk.red(`[${time()}] ERROR  ${text}`));
    },

    bot(text) {
        console.log(chalk.magenta(`[${time()}] KENYA-ULTRA  ${text}`));
    },

    line() {
        console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    }

};
