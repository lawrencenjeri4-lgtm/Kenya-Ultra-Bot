const commands = require("../lib/command");

module.exports = {
    name: "Menu",
    aliases: ["menu", "help"],
    category: "General",
    description: "Displays the bot menu.",
    usage: ".menu",
    cooldown: 3,

    async execute(sock, m) {

        const prefix = process.env.PREFIX || ".";

        const categoryIcons = {
            General: "📂",
            Utility: "🛠",
            Download: "📥",
            AI: "🤖",
            Group: "👥",
            Owner: "👑",
            Fun: "🎮",
            Search: "🔎",
            Convert: "🔄",
            Anime: "🌸",
            Other: "📦"
        };

        const allCommands = commands.all();

        const grouped = {};

        for (const cmd of allCommands) {

            const category = cmd.category || "Other";

            if (!grouped[category]) grouped[category] = [];

            grouped[category].push(cmd);

        }

        let menu = `
╭━━━〔 🤖 Kenya-Ultra 〕━━━⬣

👋 Hello!

⚡ Status : Online
📦 Version : v1.0.0
🔖 Prefix : ${prefix}
📚 Commands : ${allCommands.length}
📂 Categories : ${Object.keys(grouped).length}

━━━━━━━━━━━━━━
`;

        for (const category of Object.keys(grouped).sort()) {

            menu += `\n${categoryIcons[category] || "📦"} ${category}\n`;

            for (const cmd of grouped[category]) {

                menu += `┃ ${prefix}${cmd.name.toLowerCase()}\n`;

            }

        }

        menu += `

━━━━━━━━━━━━━━
© Kenya-Ultra Bot`;

        await m.reply(menu);

    }
};
