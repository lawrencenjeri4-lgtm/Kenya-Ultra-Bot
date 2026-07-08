const fs = require("fs");
const path = require("path");
const { register } = require("../lib/command");

function loadPlugins() {
    const pluginsDir = path.join(__dirname, "..", "plugins");

    if (!fs.existsSync(pluginsDir)) {
        console.log("⚠️ Plugins folder not found.");
        return;
    }

    const files = fs.readdirSync(pluginsDir)
        .filter(file => file.endsWith(".js"));

    for (const file of files) {
        try {
            const plugin = require(path.join(pluginsDir, file));

            register(plugin);

            console.log(`✅ Loaded plugin: ${plugin.name}`);
        } catch (err) {
            console.error(`❌ Failed to load ${file}`);
            console.error(err);
        }
    }
}

module.exports = {
    loadPlugins
};
