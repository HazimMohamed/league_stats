const fs = require("node:fs/promises");

const SECRETS_FILE_NAME = "./secrets.json";

async function createSecrets() {
    const newFile = await fs.open(SECRETS_FILE_NAME, "w");
    const placeHolder = "Enter your values here";
    const tempData = {
        "MONGO_USERNAME": placeHolder,
        "MONGO_PASSWORD": placeHolder,
        "RIOT_API_KEY": placeHolder
    };

    await newFile.write(JSON.stringify(tempData));
}

async function readSecrets() {
    try {
        const contents = await fs.readFile(SECRETS_FILE_NAME);
        return JSON.parse(contents);
    } catch (e) {
        console.error(JSON.stringify(e));
        if (e instanceof Error && e.code === "ENOENT") {
            await createSecrets();
            console.error(`Secrets not found. Created ${SECRETS_FILE_NAME}. 
            Enter secrets then rerun.`);
            process.exit(1);
        } else throw e;
    }
}

module.exports = {readSecrets};