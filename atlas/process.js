const COUNT_COLLECTION = 'win_loss_counts';

async function ensureCountCollection(db) {
    const existingCollections = (await db.listCollections().toArray()).map((m) => m.name);
    if (!existingCollections.includes(COUNT_COLLECTION)) {
        await db.createCollection(COUNT_COLLECTION);
    }
    const countCollection = await db.collection(COUNT_COLLECTION);
    const numDocs = await countCollection.countDocuments();
    if (numDocs < 1) {
        const blankCount = {
            'wins': 0,
            'losses': 0,
            'lastMatchPointer': null
        }
        await countCollection.insertOne(blankCount);
    }
}

async function readCurrentCount(db) {
    return db.collection(COUNT_COLLECTION).findOne({});
}

async function writeCount(db, newValues) {
    return db.collection(COUNT_COLLECTION).findOneAndUpdate({}, {
        $set: newValues
    });
}

/// Gets info/participants/4/summonerName
function getParticipantInformation(matchData, summonerName) {
    const participants = matchData['info']['participants'];
    const summonerInfo = participants.find((p) => p['summonerName'] === summonerName);
    if (!summonerInfo) {
        throw Error(`Cannot find participant ${summonerName} in match ${matchData['metadata']['matchId']}`);
    }
    return summonerInfo;
}

async function processNewMatch(db, newMatch) {
    await ensureCountCollection(db);

    const currentCount = await readCurrentCount(db);
    const myInfo = getParticipantInformation(newMatch, 'BootyFanatic');

    currentCount['lastMatchPointer'] = newMatch['metadata']['matchId'];
    if (myInfo['win']) {
        currentCount['wins'] += 1;
    } else {
        currentCount['losses'] += 1;
    }

    await writeCount(db, currentCount);
}

module.exports = {processNewMatch, ensureCountCollection, readCurrentCount, writeCount}