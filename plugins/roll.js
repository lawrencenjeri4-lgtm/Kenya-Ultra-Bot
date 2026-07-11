module.exports = {
    name: "roll",
    aliases: ["dice"],
    category: "Games",
    description: "Roll a six-sided dice.",

    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const number = Math.floor(Math.random() * 6) + 1;

        await sock.sendMessage(from, {
            text: `🎲 You rolled: *${number}*`
        });
    }
};
