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

    let loaded = 0;
    let failed = 0;

    console.log("\n==============================");
    console.log("🚀 Loading Kenya-Ultra Plugins");
    console.log("==============================");

    for (const file of files) {

        try {

            const pluginPath = path.join(pluginsDir, file);

            // Clear cache so future reloads work
            delete require.cache[require.resolve(pluginPath)];

            const plugin = require(pluginPath);

            // Validate plugin
            if (!plugin.name || typeof plugin.execute !== "function") {

                console.log(`⚠️ Invalid plugin: ${file}`);

                failed++;

                continue;

            }

            register(plugin);

            loaded++;

            console.log(`✅ ${plugin.name}`);

        } catch (err) {

            failed++;

            console.log(`❌ ${file}`);

            console.error(err);

        }

    }

    console.log("==============================");
    console.log(`✅ Loaded : ${loaded}`);
    console.log(`❌ Failed : ${failed}`);
    console.log(`📦 Total  : ${files.length}`);
    console.log("==============================\n");

}

module.exports = {
    loadPlugins
};
