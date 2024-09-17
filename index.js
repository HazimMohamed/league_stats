const {getPlayerId, getPlayerMatches, getMatchInformation} = require("./lib/riot_api/endpoints");
const {MongoHandle} = require("./lib/mongo");
const {Match} = require("./lib/riot_api/match");

(async () => {
    const dbHandle = new MongoHandle();
    await dbHandle.init();

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
        if (!isRecorded) {
            await dbHandle.write(m);
            console.log(`${c++}: Wrote match ${m.toStringAs(player.puuid)}`);
        } else {
            console.log(`${c++}: Already have match ${m.toStringAs(player.puuid)}`);
        }
    }

    await dbHandle.close();
})();
