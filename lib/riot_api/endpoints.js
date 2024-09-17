const axios= require('axios');
const { backOff } = require("exponential-backoff");
const { readSecrets } = require("../secrets");
const {AxiosError} = require("axios");
const {hitRoute} = require("./adapter");

async function getPlayerId(player) {
    let route = `riot/account/v1/accounts/by-riot-id/${player.name}/${player.tag}`

    const res  = await hitRoute(route);
    if (!res['puuid']) {
        console.error(`Bad response to player ID. Missing PUUID: ${res}`)
    }

    return res['puuid'];
}

async function getPlayerMatches(player) {
    const route = `/lol/match/v5/matches/by-puuid/${await getPlayerId(player)}/ids`;

    return await hitRoute(route);
}

async function getMatchInformation(match_id) {
    const route = `lol/match/v5/matches/${match_id}`

    return hitRoute(route);
}

module.exports = {getPlayerId, getPlayerMatches, getMatchInformation}