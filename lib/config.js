const fs = require("node:fs/promises");

const CONFIG_FILE_NAME = "./config.json";

async function createConfig() {
    const newFile = await fs.open(CONFIG_FILE_NAME, "w");
    const placeHolder = "Enter your values here";
    const tempData = {
        "MONGO_USERNAME": placeHolder,
        "MONGO_PASSWORD": placeHolder,
        "LOG_FOLDER": './logs',
        "RIOT_API_KEY": placeHolder,
        "TIMEZONE": 'America/New_York'
    };

    await newFile.write(JSON.stringify(tempData, null, 3));
}

async function readConfig() {
    try {
        const contents = await fs.readFile(CONFIG_FILE_NAME);
        return JSON.parse(contents);
    } catch (e) {
        console.error(JSON.stringify(e));
        if (e instanceof Error && e.code === "ENOENT") {
            await createConfig();
            console.error(`Config not found. Created ${CONFIG_FILE_NAME}. Enter config then rerun.`);
            process.exit(1);
        } else throw e;
    }
}

module.exports = {readConfig};