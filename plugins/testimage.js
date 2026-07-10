const fs = require("fs");
const path = require("path");

module.exports = {
    name: "testimage",
    aliases: ["ti"],
    category: "General",
    description: "Tests image sending.",

    async execute(sock, m) {

        const image = path.join(__dirname, "..", "assets", "menu-banner.png");

        await sock.sendMessage(m.chat, {
            image: fs.readFileSync(image),
            caption: "✅ Kenya-Ultra image test successful!"
        });

    }
};
