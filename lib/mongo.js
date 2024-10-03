const {MongoClient, ServerApiVersion} = require("mongodb");
const {readConfig} = require("./config");

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
        const c = this.db.collection('matches_raw');
        const inserted = c.insertOne(match.json);
        const now = new Date(Date.now());
        await this.db.collection('meta').updateOne({}, {
            '$set': {
                'lastUpdated': now.toISOString()
            }
        })
        return inserted;
    }

    async getLastUpdated() {
        const d = await this.db.collection('meta').findOne({});
        return new Date(d['lastUpdated']);
    }

    async close() {
        await this.client.close();
    }
}

module.exports = {MongoHandle}