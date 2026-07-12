const { getTargetJid } = require("../lib/functions");

module.exports = {
    name: "unblock",
    category: "Owner",
    description: "Unblock a user.",
    usage: ".unblock @user  (or reply to their message with .unblock)",
    owner: true,

    async execute(sock, m) {

        const target = getTargetJid(m);

        if (!target) {
            return m.reply("❌ Mention a user or reply to their message.\nUsage: .unblock @user");
        }

        try {
            await sock.updateBlockStatus(target, "unblock");
            await m.reply(`✅ Unblocked @${target.split("@")[0]}`, { mentions: [target] });
        } catch (err) {
            console.error(err);
            await m.reply("⚠️ Failed to unblock user.");
        }
    }
};
