module.exports = {
    name: "uppercase",
    aliases: ["upper"],
    category: "Utility",
    description: "Convert text to uppercase.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Example:\n.upper hello world"
            });
        }

        await sock.sendMessage(from, {
            text: args.join(" ").toUpperCase()
        });
    }
};
