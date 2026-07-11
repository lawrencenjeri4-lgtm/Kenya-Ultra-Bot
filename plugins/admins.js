module.exports = {
    name: "admins",
    aliases: ["adminlist"],
    category: "Group",
    description: "List all group admins.",

    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const metadata = await sock.groupMetadata(from);

        const admins = metadata.participants.filter(
            p => p.admin !== null
        );

        let text = "👑 *GROUP ADMINS*\n\n";

        let mentions = [];

        admins.forEach((admin, i) => {
            mentions.push(admin.id);
            text += `${i + 1}. @${admin.id.split("@")[0]}\n`;
        });

        await sock.sendMessage(from, {
            text,
            mentions
        });
    }
};
