module.exports = {
    name: "randomnumber",
    aliases: ["rand", "random"],
    category: "Tools",
    description: "Generate a random number.",

    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        let max = parseInt(args[0]);

        if (isNaN(max) || max < 1) max = 100;

        const number = Math.floor(Math.random() * max) + 1;

        await sock.sendMessage(from, {
            text: `🎲 Random Number (1-${max})\n\n*${number}*`
        });
    }
};
