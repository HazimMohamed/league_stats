const {getPlayerId, getPlayerMatches, getMatchInformation} = require("./lib/riot_api/endpoints");
const {MongoHandle} = require("./lib/mongo");
const {Match} = require("./lib/riot_api/match");
const {initLogging} = require('./lib/logging');
const {ExpiredApiKeyError} = require('./lib/riot_api/errors');

async function main() {
    const dbHandle = new MongoHandle();
    await dbHandle.init();

    try {
        let player = {
            "name": "BootyFanatic",
            "tag": "na1",
        };
        player["puuid"] = await getPlayerId(player);

        const recentMatchIds = await getPlayerMatches(player);
        let c = 1;
        for (const mid of recentMatchIds) {
            const m = new Match(await getMatchInformation(mid));
            const isRecorded = await dbHandle.isMatchRecorded(m.id);
            const ind = Intl.NumberFormat('en-US', {
                minimumIntegerDigits: 2
            }).format(c++);
            if (!isRecorded) {
                await dbHandle.write(m);
                logger.info(`${ind}: Wrote match ${m.toStringAs(player.puuid)}`);
            } else {
                logger.info(`${ind}: Already have match ${m.toStringAs(player.puuid)}`);
            }
        }
        await dbHandle.setExpiredApiKey(false);
    } catch (e) {
        if (e instanceof ExpiredApiKeyError) {
            await dbHandle.setExpiredApiKey(true);
        }
        throw e;
    } finally {
        await dbHandle.close();
    }
}

(async () => {
    await initLogging();
    await main();
})();