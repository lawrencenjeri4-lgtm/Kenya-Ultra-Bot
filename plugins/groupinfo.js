module.exports = {
    name: "groupinfo",
    aliases: ["ginfo"],
    category: "Group",
    description: "Show information about the current group.",
    usage: ".groupinfo",
    group: true,

    async execute(sock, m) {

        const metadata = await sock.groupMetadata(m.chat);
        const adminCount = metadata.participants.filter(
            p => p.admin === "admin" || p.admin === "superadmin"
        ).length;

        const text =
`╭━━━〔 📋 Group Info 〕━━━╮
│
│ 🏷️ Name : ${metadata.subject}
│ 🆔 ID : ${metadata.id}
│ 👥 Members : ${metadata.participants.length}
│ 👮 Admins : ${adminCount}
│ 📝 Description : ${metadata.desc || "None"}
│
╰━━━━━━━━━━━━━━━━━━╯`;

        await m.reply(text);
    }
};
