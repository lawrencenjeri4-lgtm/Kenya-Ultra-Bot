module.exports = {
    name: "tagall",
    aliases: ["everyone"],
    category: "Group",
    description: "Mention all group members.",

    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const metadata = await sock.groupMetadata(from);

        let text = "📢 *TAGGING EVERYONE*\n\n";
        let mentions = [];

        for (const member of metadata.participants) {
            mentions.push(member.id);
            text += `➤ @${member.id.split("@")[0]}\n`;
        }

        await sock.sendMessage(from, {
            text,
            mentions
        });
    }
};
