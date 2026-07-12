const { getGroupAdmins } = require("../lib/functions");

module.exports = {
    name: "tagall",
    aliases: ["everyone"],
    category: "Group",
    description: "Mention every member of the group.",
    usage: ".tagall [message]",
    group: true,

    async execute(sock, m, args) {

        const admins = await getGroupAdmins(sock, m.chat);

        if (!m.isOwner && !admins.includes(m.sender)) {
            return m.reply("❌ Only group admins can use this command.");
        }

        const metadata = await sock.groupMetadata(m.chat);
        const participants = metadata.participants.map(p => p.id);
        const note = args.join(" ") || "Attention everyone!";

        let text = `📢 *${note}*\n\n`;

        for (const p of participants) {
            text += `@${p.split("@")[0]}\n`;
        }

        await sock.sendMessage(m.chat, { text, mentions: participants }, { quoted: m.msg });
    }
};
