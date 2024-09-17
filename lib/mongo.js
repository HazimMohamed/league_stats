const { MongoClient, ServerApiVersion } = require('mongodb');
const { readSecrets  } = require('./secrets');

class MongoHandle {
    async init() {
        const secrets = await readSecrets();
        const mongoUri =`mongodb+srv://${secrets['MONGO_USERNAME']}:${secrets['MONGO_PASSWORD']}@startgazerv2.hojhz.mongodb.net/?retryWrites=true&w=majority&appName=StartGazerV2`
        this.client = new MongoClient(mongoUri, {
          serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          }
        });

        await this.client.connect();
        this.db = this.client.db('league_matches');
    }

    async isMatchRecorded(matchUuid) {
        const c = this.db.collection("matches_raw");
        const existingRecords = await c.countDocuments({
            "metadata.matchId": matchUuid
        });
        return existingRecords > 0;
    }

    async write(match) {
        const c = this.db.collection("matches_raw");
        c.insertOne(match.json);
    }

    async close() {
        await this.client.close();
    }
}

module.exports = { MongoHandle }