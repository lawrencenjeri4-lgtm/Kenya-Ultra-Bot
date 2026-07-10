module.exports = {
    name: "test",
    category: "General",

    async execute(sock, m) {
        await m.reply(
`Owner: ${m.isOwner}
Sender: ${m.sender}`
        );
    }
};
