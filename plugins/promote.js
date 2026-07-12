const { getTargetJid, getGroupAdmins, getBotJid } = require("../lib/functions");

module.exports = {
    name: "promote",
    aliases: ["admin"],
    category: "Group",
    description: "Make a member a group admin.",
    usage: ".promote @user  (or reply to their message with .promote)",
    group: true,

    async execute(sock, m) {

        const admins = await getGroupAdmins(sock, m.chat);

        if (!m.isOwner && !admins.includes(m.sender)) {
            return m.reply("❌ Only group admins can use this command.");
        }

        if (!admins.includes(getBotJid(sock))) {
            return m.reply("❌ I need to be an admin to promote members.");
        }

        const target = getTargetJid(m);

        if (!target) {
            return m.reply("❌ Mention a user or reply to their message.\nUsage: .promote @user");
        }

        try {
            await sock.groupParticipantsUpdate(m.chat, [target], "promote");
            await m.reply(`✅ @${target.split("@")[0]} is now an admin.`, { mentions: [target] });
        } catch (err) {
            console.error(err);
            await m.reply("⚠️ Failed to promote member. Make sure I'm an admin.");
        }
    }
};
