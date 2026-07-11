module.exports = {
    name: "reverse",
    aliases: ["rev"],
    category: "Utility",
    description: "Reverse any text.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Please provide text.\n\nExample:\n.reverse Hello Kenya-Ultra"
            });
        }

        const text = args.join(" ");
        const reversed = text.split("").reverse().join("");

        await sock.sendMessage(from, {
            text: `🔄 *Reversed Text:*\n${reversed}`
        });
    }
};
