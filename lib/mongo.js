const {MongoClient, ServerApiVersion} = require("mongodb");
const {readConfig} = require("./config");
const prompts = require("prompts");

class MongoHandle {
    async init() {
        const config = await readConfig();
        const mongoUri = `mongodb+srv://${config["MONGO_USERNAME"]}:${config["MONGO_PASSWORD"]}@startgazerv2.hojhz.mongodb.net/?retryWrites=true&w=majority&appName=StartGazerV2`;
        this.client = new MongoClient(mongoUri, {
            serverApi: {
                version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
            }
        });

        await this.client.connect();
        this.db = this.client.db("league_matches");
    }

    async isMatchRecorded(matchUuid) {
        const c = this.db.collection("matches_raw");
        const existingRecords = await c.countDocuments({
            "metadata.matchId": matchUuid
        });
        return existingRecords > 0;
    }

    async setExpiredApiKey(isExpired) {
        const c = this.db.collection('meta');
        await c.updateOne({}, {
            $set: {
                'isApiKeyValid': !isExpired
            }
        });
    }

    async isApiKeyValid() {
        const c = this.db.collection('meta');
        const metadata = await c.findOne({});
        return metadata['isApiKeyValid'];
    }

    async write(match) {
        const c = this.db.collection("matches_raw");
        return c.insertOne(match.json);
    }

    async reset(collectionName) {
        const collections = await this.db.listCollections().toArray();
        if (!collections.map((c) => c.name).includes(collectionName)) {
            console.error(`Cannot delete collection ${collectionName}. No such collection.`);
            return;
        }

        const resp = await prompts({
            type: "confirm",
            name: "ans",
            message: `This will delete ALL entries in the matches_raw collection. Are you SURE?`,
            initial: false
        });

        if (!resp["ans"]) {
            console.log("Aborting...");
            return;
        }
        await this.db.collection(collectionName).deleteMany({});
        console.log(`Emptied ${collectionName}@${this.db.databaseName}.`);
    }

    async close() {
        await this.client.close();
    }
}

module.exports = {MongoHandle}