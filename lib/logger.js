const chalk = require("chalk");

class Logger {

    time() {
        return new Date().toLocaleTimeString();
    }

    info(message) {
        console.log(
            chalk.cyan(`[${this.time()}] [INFO] ${message}`)
        );
    }

    success(message) {
        console.log(
            chalk.green(`[${this.time()}] [SUCCESS] ${message}`)
        );
    }

    warn(message) {
        console.log(
            chalk.yellow(`[${this.time()}] [WARNING] ${message}`)
        );
    }

    error(message) {
        console.log(
            chalk.red(`[${this.time()}] [ERROR] ${message}`)
        );
    }

    bot(message) {
        console.log(
            chalk.magenta(`[${this.time()}] [KENYA-ULTRA] ${message}`)
        );
    }

    line() {
        console.log(
            chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        );
    }

}

module.exports = new Logger();
