const config = require("../config");

module.exports = {
    name: "mode",
    aliases: ["botmode"],
    category: "Owner",
    description: "Change the bot operating mode.",
    usage: ".mode <public|private|self|group>",
    owner: true,

    async execute(sock, m, args) {

        if (!args[0]) {
            return m.reply(`╭━━〔 🤖 Kenya-Ultra Modes 〕━━╮
┃
┃ 🌍 public  → Everyone can use commands
┃ 🔒 private → Only owner can use commands
┃ 👤 self    → Only bot account messages
┃ 👥 group   → Commands only work in groups
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

Example:
.mode public`);
        }

        const newMode = args[0].toLowerCase();

        const validModes = [
            "public",
            "private",
            "self",
            "group"
        ];

        if (!validModes.includes(newMode)) {
            return m.reply(`❌ Invalid mode.

Available modes:
• public
• private
• self
• group`);
        }

        const oldMode = config.settings.mode;

        if (oldMode === newMode) {
            return m.reply(`ℹ️ Kenya-Ultra is already running in *${newMode.toUpperCase()}* mode.`);
        }

        config.settings.mode = newMode;

        await m.reply(`╭━━〔 ✅ Mode Updated 〕━━╮
┃
┃ Old Mode : ${oldMode.toUpperCase()}
┃ New Mode : ${newMode.toUpperCase()}
┃
┃ 🤖 Kenya-Ultra is now
┃ running in ${newMode.toUpperCase()} mode.
┃
╰━━━━━━━━━━━━━━━━━━╯`);
    }
};
