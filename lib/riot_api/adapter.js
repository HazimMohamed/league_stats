const axios = require("axios");
const {readConfig} = require("../config");
const {RateLimitThreshold} = require("rate-limit-threshold");
const {ExpiredApiKeyError} = require("./errors");

const rateLimiter = new RateLimitThreshold(15, 1);

async function hitRoute(path, options) {
    path ??= ""
    if (path[0] === "/") path = path.substring(1);

    options = {
        "route": "americas",
        ...options
    };
    const validRouting = ["americas", "na1"];

    if (validRouting.indexOf(options.route) === -1) {
        throw `Invalid routing option: ${options.route}. 
	    Valid options: ${validRouting.join(", ")}`;
    }

    const url = new URL(`https://${options.route}.api.riotgames.com`);
    url.pathname = path

    const apiToken = (await readConfig()).RIOT_API_KEY;
    let headers = {
        "X-Riot-Token": apiToken,
        "accept": "application/json"
    }
    let config = {
        "headers": headers
    }

    await rateLimiter.limit();
    const resp = await axios.get(url, config);
    if (resp.status === 403) {
        throw new ExpiredApiKeyError(apiToken);
    } else {
        return resp.data;
    }
}

module.exports = {hitRoute}