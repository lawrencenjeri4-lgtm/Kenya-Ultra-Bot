module.exports = {
    name: "pick",
    aliases: ["choose"],
    category: "Fun",
    description: "Choose randomly from options separated by |",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        const text = args.join(" ");

        if (!text.includes("|")) {
            return sock.sendMessage(from, {
                text: "❌ Example:\n.pick Pizza | Burger | Chips"
            });
        }

        const choices = text.split("|").map(x => x.trim()).filter(Boolean);
        const choice = choices[Math.floor(Math.random() * choices.length)];

        await sock.sendMessage(from, {
            text: `🎲 I choose: *${choice}*`
        });
    }
};
