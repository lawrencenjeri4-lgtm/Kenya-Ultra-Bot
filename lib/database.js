const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database");

if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, {
        recursive: true
    });
}

module.exports = {

    read(file) {

        const target = path.join(dbPath, file);

        if (!fs.existsSync(target)) return {};

        return JSON.parse(fs.readFileSync(target));

    },

    write(file, data) {

        const target = path.join(dbPath, file);

        fs.writeFileSync(
            target,
            JSON.stringify(data, null, 2)
        );

    }

};
