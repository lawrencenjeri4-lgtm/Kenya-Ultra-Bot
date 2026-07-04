const { runtime } = require("../lib/functions");

module.exports = {

    name: "runtime",

    aliases: ["uptime"],

    category: "General",

    desc: "Bot uptime",

    async execute(sock, m, args) {

        await m.reply(
            `⏳ Uptime\n\n${runtime(process.uptime())}`
        );

    }
};

