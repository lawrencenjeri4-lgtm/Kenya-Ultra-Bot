const commands = new Map();

function register(command) {

    if (!command.name)
        throw new Error("Command name missing.");

    commands.set(command.name.toLowerCase(), command);

    if (command.aliases) {

        for (const alias of command.aliases) {

            commands.set(alias.toLowerCase(), command);

        }

    }

}

function get(name) {

    return commands.get(name.toLowerCase());

}

function all() {

    return [...new Set(commands.values())];

}

module.exports = {
    register,
    get,
    all
};
