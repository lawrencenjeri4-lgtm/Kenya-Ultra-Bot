const fs = require("fs");
const path = require("path");
const { all } = require("../lib/command");
const { getSettings } = require("../lib/settings");

module.exports = {

    name: "menu",
    aliases: ["m"],
    category: "General",
    description: "Displays the command menu.",
    usage: ".menu",

    async execute(sock, m) {

        const settings = getSettings();
        const prefix = settings.prefix || ".";

        const commands = all();

        const categories = {};

        for (const cmd of commands) {

            const category = cmd.category || "Other";

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push(cmd.name);
        }

        let text = `╭━━━〔 🇰🇪 Kenya-Ultra Bot 〕━━━╮
┃
┃ 👤 User : ${m.fromMe ? "Owner" : "User"}
┃ 🤖 Version : v1.0.0
┃ ⚡ Prefix : ${prefix}
┃ 📦 Commands : ${commands.length}
┃
╰━━━━━━━━━━━━━━━━━━╯

`;

        for (const category in categories) {

            text += `╭─〔 ${category.toUpperCase()} 〕\n`;

            for (const cmd of categories[category]) {

                text += `│ ◦ ${prefix}${cmd}\n`;

            }

            text += `╰──────────────\n\n`;

        }

        text += "© Kenya-Ultra";

        const imagePath = path.join(
            __dirname,
            "..",
            "assets",
            "menu-banner.png"
        );

        if (fs.existsSync(imagePath)) {

            await sock.sendMessage(
                m.chat,
                {
                    image: fs.readFileSync(imagePath),
                    caption: text
                },
                {
                    quoted: m.msg
                }
            );

        } else {

            await m.reply(text);

        }

    }

};
