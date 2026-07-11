module.exports = {
    name: "8ball",
    aliases: ["fortune"],
    category: "Fun",
    description: "Magic 8 Ball answers your question.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Example:\n.8ball Will Kenya Ultra become popular?"
            });
        }

        const answers = [
            "✅ Yes.",
            "❌ No.",
            "🤔 Maybe.",
            "😅 Ask again later.",
            "🔥 Definitely!",
            "🙅 Very unlikely.",
            "💯 Without a doubt.",
            "🌧️ Doesn't look good.",
            "🎉 Absolutely!",
            "👀 The future is uncertain."
        ];

        const answer = answers[Math.floor(Math.random() * answers.length)];

        await sock.sendMessage(from, {
            text: `🎱 ${answer}`
        });
    }
};
