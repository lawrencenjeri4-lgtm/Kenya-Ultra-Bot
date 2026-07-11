const commands = new Map();
const aliases = new Map();

function register(command) {

    if (!command.name) {
        throw new Error("Command name missing.");
    }

    const name = command.name.toLowerCase();

    // Prevent duplicate command names
    if (commands.has(name)) {
        console.log(`⚠️ Duplicate command skipped: ${name}`);
        return;
    }

    commands.set(name, command);

    // Register aliases
    if (Array.isArray(command.aliases)) {

        for (const alias of command.aliases) {

            const key = alias.toLowerCase();

            if (commands.has(key) || aliases.has(key)) {
                console.log(`⚠️ Duplicate alias skipped: ${key}`);
                continue;
            }

            aliases.set(key, command);

        }

    }

}

function get(name) {

    if (!name) return null;

    name = name.toLowerCase();

    return commands.get(name) || aliases.get(name) || null;

}

function all() {

    return [...commands.values()];

}

function count() {

    return commands.size;

}

function aliasCount() {

    return aliases.size;

}

function categories() {

    const list = {};

    for (const command of commands.values()) {

        const category = command.category || "Other";

        if (!list[category]) {
            list[category] = [];
        }

        list[category].push(command);

    }

    return list;

}

module.exports = {
    register,
    get,
    all,
    count,
    aliasCount,
    categories
};
