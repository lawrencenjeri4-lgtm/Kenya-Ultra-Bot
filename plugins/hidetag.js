module.exports = {
    name: "hidetag",
    aliases: ["htag"],
    category: "Group",
    description: "Mention everyone without showing tags.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "Example:\n.hidetag Meeting starts now!"
            });
        }

        const metadata = await sock.groupMetadata(from);

        const mentions = metadata.participants.map(x => x.id);

        await sock.sendMessage(from, {
            text: args.join(" "),
            mentions
        });
    }
};
