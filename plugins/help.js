const { getSettings } = require("../lib/settings");

module.exports = {
    name: "help",
    aliases: ["cmds"],

    category: "General",

    async execute(sock, m) {

        const settings = getSettings();

        m.reply(
`Use

${settings.prefix}menu

to view all available commands.`
        );

    }
};
