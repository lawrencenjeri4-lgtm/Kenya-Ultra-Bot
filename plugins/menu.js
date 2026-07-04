const { BOT_NAME, VERSION, PREFIX } = require("../config");

module.exports = {

    name: "menu",

    aliases: ["help2"],

    category: "General",

    desc: "Show command menu",

    async execute(sock, m, args) {

        const text = `
╭━━━〔 ${BOT_NAME} 〕━━━⬣

👋 Welcome to Kenya-Ultra

📦 Version : ${VERSION}
Prefix : ${PREFIX}

━━━━━━━━━━━━━━

📂 General
• ${PREFIX}ping
• ${PREFIX}alive
• ${PREFIX}runtime
• ${PREFIX}menu
• ${PREFIX}help

🤖 AI
• ${PREFIX}gpt

🎨 Media
• ${PREFIX}sticker

👑 Owner
• ${PREFIX}restart
• ${PREFIX}shutdown

━━━━━━━━━━━━━━

© Lucid Tech Solutions
`;

        await m.reply(text.trim());

    }
};

