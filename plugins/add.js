module.exports = {
    name: "add",
    category: "Admin",
    description: "Add a member.",
    usage: ".add 2547xxxxxxxx",
    group: true,

    async execute(sock, m, args) {

        if (!m.isAdmin)
            return m.reply("❌ You must be a group admin.");

        if (!args[0])
            return m.reply("Example:\n.add 254712345678");

        const number =
            args[0].replace(/\D/g, "") +
            "@s.whatsapp.net";

        try {

            const result = await sock.groupParticipantsUpdate(
                m.chat,
                [number],
                "add"
            );

            console.log(result);

            return m.reply("✅ User added successfully.");

        } catch (err) {

            console.error(err);

            return m.reply(
                "❌ Failed to add user.\n" +
                (err.message || err)
            );

        }

    }
};
