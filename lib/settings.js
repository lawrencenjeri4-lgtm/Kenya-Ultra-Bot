const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "database", "settings.json");

function getSettings() {
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveSettings(settings) {
    fs.writeFileSync(file, JSON.stringify(settings, null, 4));
}

module.exports = {
    getSettings,
    saveSettings
};
