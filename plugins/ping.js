module.exports = {
    name: "Ping",

    aliases: ["ping", "p"],

    category: "General",

    description: "Check bot response speed.",

    usage: ".ping",

    cooldown: 3,

    owner: false,

    admin: false,

    group: false,

    private: false,

    premium: false,

    async execute(sock, m, args) {

        await m.react("🏓");

        await m.reply("🏓 Pong!");

    }
};

