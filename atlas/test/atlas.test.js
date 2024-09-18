const atlasFuncs = require('../process');
const {MongoClient} = require("mongodb");
const {assert} = require("chai");
const {SAMPLE_WIN, SAMPLE_LOSS} = require("./testdata");

describe('atlasCountingTests', function () {
    let db;

    before(async function () {
        const connection = new MongoClient(process.env.TEST_MONGO_URL);
        db = connection.db('league_matches')
    });

    beforeEach(async function () {
        for await (const c of db.listCollections().stream()) await db.dropCollection(c.name);
    });

    it('Can create and update loss', async () => {
        await atlasFuncs.ensureCountCollection(db);
        assert.include(await atlasFuncs.readCurrentCount(db), {
            'wins': 0,
            'losses': 0,
            'lastMatchPointer': null
        });

        const sampleLossId = SAMPLE_LOSS['metadata']['matchId'];
        await atlasFuncs.processNewMatch(db, SAMPLE_LOSS);
        assert.include(await atlasFuncs.readCurrentCount(db), {
            'wins': 0,
            'losses': 1,
            'lastMatchPointer': sampleLossId
        });
    });

    it('Can create and update win', async () => {
        await atlasFuncs.ensureCountCollection(db);
        assert.include(await atlasFuncs.readCurrentCount(db), {
            'wins': 0,
            'losses': 0,
            'lastMatchPointer': null
        });

        const sampleWinId = SAMPLE_WIN['metadata']['matchId'];
        await atlasFuncs.processNewMatch(db, SAMPLE_WIN);
        assert.include(await atlasFuncs.readCurrentCount(db), {
            'wins': 1,
            'losses': 0,
            'lastMatchPointer': sampleWinId
        });
    });

    it('Does not overwrite records if existing', async () => {
        await atlasFuncs.ensureCountCollection(db);
        await atlasFuncs.writeCount(db, {
            'wins': 1567,
            'losses': 1587
        });

        // Make sure this doesn't overwrite
        await atlasFuncs.ensureCountCollection(db);
        await atlasFuncs.processNewMatch(db, SAMPLE_WIN);
        assert.include(await atlasFuncs.readCurrentCount(db), {
            'wins': 1568,
            'losses': 1587
        });
    });
});

