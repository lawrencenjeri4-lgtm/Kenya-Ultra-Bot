module.exports = {
    name: "count",
    aliases: ["wordcount"],
    category: "Utility",
    description: "Count words and characters.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(from, {
                text: "❌ Example:\n.count Kenya Ultra is awesome"
            });
        }

        const text = args.join(" ");

        const words = text.trim().split(/\s+/).length;
        const chars = text.length;

        await sock.sendMessage(from, {
            text:
`📊 *Text Statistics*

📝 Words: ${words}
🔤 Characters: ${chars}`
        });
    }
};
