const commands = new Map();

function register(command) {
    if (!command.name) {
        throw new Error("Command must have a name.");
    }

    commands.set(command.name.toLowerCase(), command);

    if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
            commands.set(alias.toLowerCase(), command);
        }
    }
}

module.exports = {
    register,
    get: (name) => commands.get(name.toLowerCase()),
    all: () => [...new Set(commands.values())]
};
