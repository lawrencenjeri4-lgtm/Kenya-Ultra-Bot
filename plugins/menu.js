const fs = require("fs");
const path = require("path");
const { all } = require("../lib/command");

module.exports = {
    name: "menu",
    aliases: ["help", "commands"],
    category: "General",
    description: "Displays the bot menu.",
    usage: ".menu",

    async execute(sock, m) {

        const commands = all();

        const categories = {};

        for (const cmd of commands) {
            const cat = cmd.category || "Other";

            if (!categories[cat]) categories[cat] = [];

            categories[cat].push(cmd.name);
        }

        let text = `╭━━━〔 🇰🇪 Kenya-Ultra Bot 〕━━━╮
┃
┃ 👤 User : ${m.fromMe ? "Owner" : "User"}
┃ 🤖 Version : v1.0.0
┃ ⚡ Prefix : .
┃ 📦 Commands : ${commands.length}
┃
╰━━━━━━━━━━━━━━━━━━╯

`;

        for (const category in categories) {

            text += `╭─〔 ${category.toUpperCase()} 〕\n`;

            for (const cmd of categories[category]) {
                text += `│ ◦ .${cmd}\n`;
            }

            text += `╰──────────────\n\n`;
        }

        text += "© Kenya-Ultra";

        const image = path.join(__dirname, "..", "assets", "menu-banner.png");

        if (fs.existsSync(image)) {

            await sock.sendMessage(
                m.chat,
                {
                    image: fs.readFileSync(image),
                    caption: text
                },
                {
                    quoted: m.key
                }
            );

        } else {

            await m.reply(text);

        }

    }
};
