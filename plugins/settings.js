const { getSettings } = require("../lib/settings");

module.exports = {
    name: "settings",
    aliases: ["config"],
    category: "General",
    description: "Shows current bot settings.",
    usage: ".settings",

    async execute(sock, m) {

        const settings = getSettings();

        const text = `╭━━〔 ⚙️ Kenya-Ultra Settings 〕━━╮

🌐 Mode           : ${settings.mode}
⌨️ Prefix         : ${settings.prefix}
📖 Auto Read      : ${settings.autoread ? "ON" : "OFF"}
⌨️ Auto Typing    : ${settings.autotyping ? "ON" : "OFF"}
🎙️ Recording      : ${settings.autorecording ? "ON" : "OFF"}
😀 Auto React     : ${settings.autoreact || "OFF"}

╰━━━━━━━━━━━━━━━━━━━━━━╯`;

        await m.reply(text);

    }
};
