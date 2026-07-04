const os = require("os");
const { VERSION, BOT_NAME } = require("../config");

module.exports = {
    name: "alive",
    aliases: ["online", "status"],
    category: "General",
    desc: "Check if bot is online",

    async execute(sock, m, args) {

        const text = `
╭━━━〔 ${BOT_NAME} 〕━━━⬣

🤖 Status : Online ✅
📦 Version : ${VERSION}
💻 Platform : ${os.platform()}
🧠 RAM : ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
⚙️ CPU : ${os.cpus()[0].model}

━━━━━━━━━━━━━━
Developed by Lucid Tech Solutions
`;

        await m.reply(text.trim());
    }
};

