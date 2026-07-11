module.exports = {
    name: "flip",
    aliases: ["coin", "coinflip"],
    category: "Games",
    description: "Flip a coin.",

    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const result = Math.random() < 0.5 ? "🪙 Heads" : "🪙 Tails";

        await sock.sendMessage(from, {
            text: `🎲 Coin Flip\n\n${result}`
        });
    }
};
