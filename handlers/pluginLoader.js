const fs = require("fs");
const path = require("path");

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
            require(path.join(pluginsDir, file));
            console.log(`✅ Loaded plugin: ${file}`);
        } catch (err) {
            console.error(`❌ Failed to load ${file}`);
            console.error(err);
        }
    }
}

module.exports = {
    loadPlugins
};
