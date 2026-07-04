const { PREFIX } = require("../config");

module.exports = {
    name: "help",
    aliases: ["commands"],

    category: "General",

    async execute(sock, m, args) {

        m.reply(
`Use

${PREFIX}menu

to view all available commands.`
        );

    }
};

