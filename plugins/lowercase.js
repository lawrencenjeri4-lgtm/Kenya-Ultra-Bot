module.exports = {
    name: "lowercase",
    aliases: ["lower"],
    category: "Utility",
    description: "Convert text to lowercase.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Example:\n.lower HELLO WORLD"
            });
        }

        await sock.sendMessage(from, {
            text: args.join(" ").toLowerCase()
        });
    }
};
