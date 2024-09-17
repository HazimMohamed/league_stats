class Match {
    constructor(jsonMatch) {
        this.jsonMatch = jsonMatch;
    }

    get id() {
        return this.jsonMatch["metadata"]["matchId"];
    }

    get json() {
        return this.jsonMatch;
    }

    getPlayerInfo(playerUuid) {
        const info = this.jsonMatch["info"]["participants"]
            .filter((p) => p["puuid"] === playerUuid);
        if (info.length !== 1) {
            throw `Error found ${info.length} players with ID ${playerUuid} in game ${this.id}`;
        }
        return info[0];
    }

    getPlayerChampion(playerUuid) {
        return this.getPlayerInfo(playerUuid)["championName"];
    }

    getPlayerKda(playerUuid) {
        const playerInfo = this.getPlayerInfo(playerUuid);
        return {
            "kills": playerInfo["kills"],
            "deaths": playerInfo["deaths"],
            "assists": playerInfo["assists"]
        };
    }

    didPlayerWin(playerUuid) {
        return this.getPlayerInfo(playerUuid)["win"];
    }

    toStringAs(playerUuid) {
        const kda = this.getPlayerKda(playerUuid);
        const stringKda = `${kda.kills}/${kda.deaths}/${kda.assists}`;
        const stringWon = this.didPlayerWin(playerUuid) ? "Victory" : "Defeat";
        return `ID: ${this.id} | ${this.getPlayerChampion(playerUuid)} ${stringKda} ${stringWon}`;
    }
}

module.exports = {Match}