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

    async execute(sock, m) {

        const start = Date.now();

        await m.react("🏓");

        const speed = Date.now() - start;

        await m.reply(
`╭──〔 🏓 Kenya-Ultra Ping 〕──╮
│
│ ⚡ Speed: ${speed} ms
│ 🤖 Status: Online
│ 🚀 Response: Excellent
│
╰────────────────────╯`
        );

    }
};
