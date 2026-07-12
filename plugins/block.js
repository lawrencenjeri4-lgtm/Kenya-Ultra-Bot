const { getTargetJid } = require("../lib/functions");

module.exports = {
    name: "block",
    category: "Owner",
    description: "Block a user.",
    usage: ".block @user  (or reply to their message with .block)",
    owner: true,

    async execute(sock, m) {

        const target = getTargetJid(m);

        if (!target) {
            return m.reply("❌ Mention a user or reply to their message.\nUsage: .block @user");
        }

        try {
            await sock.updateBlockStatus(target, "block");
            await m.reply(`✅ Blocked @${target.split("@")[0]}`, { mentions: [target] });
        } catch (err) {
            console.error(err);
            await m.reply("⚠️ Failed to block user.");
        }
    }
};
