const { execSync } = require("child_process");

const packages = [
    "@whiskeysockets/baileys",
    "axios",
    "chalk",
    "pino",
    "moment-timezone",
    "fs-extra",
    "node-fetch",
    "file-type",
    "qrcode-terminal",
    "mime-types"
];

for (const pkg of packages) {
    try {
        require.resolve(pkg);
        console.log(`✅ ${pkg} already installed`);
    } catch {
        console.log(`📦 Installing ${pkg}...`);
        execSync(`npm install ${pkg}`, { stdio: "inherit" });
    }
}

console.log("✅ Dependency check complete.");
