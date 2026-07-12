module.exports = {
    name: "broadcast",
    aliases: ["bc"],
    category: "Owner",
    description: "Send a message to every group the bot is in.",
    usage: ".broadcast <message>",
    owner: true,

    async execute(sock, m, args) {

        const text = args.join(" ");

        if (!text) {
            return m.reply("📢 Usage: .broadcast <message>");
        }

        const groups = await sock.groupFetchAllParticipating();
        const ids = Object.keys(groups);

        let sent = 0;

        for (const id of ids) {
            try {
                await sock.sendMessage(id, { text: `📢 *Broadcast*\n\n${text}` });
                sent++;
            } catch (err) {
                console.error(`Failed to broadcast to ${id}`, err);
            }
        }

        await m.reply(`✅ Broadcast sent to ${sent}/${ids.length} groups.`);
    }
};
