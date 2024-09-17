const axios = require('axios');
const { readSecrets } = require("../secrets");
const { RateLimitThreshold }  = require("rate-limit-threshold");

const rateLimiter = new RateLimitThreshold(15,1);

function isErrorRateLimit(err, _) {
    return err instanceof axios.AxiosError && err.code === 429;
}

async function hitRoute(path, options) {
    path ??= ''
   if (path[0] === '/') path = path.substring(1);

    options = {
        'route': 'americas',
        ...options
    }
    const validRouting = ['americas', 'na1'];

    if (validRouting.indexOf(options.route) === -1) {
	    throw `Invalid routing option: ${options.route}. 
	    Valid options: ${validRouting.join(', ')}`;
    }

    const url = new URL(`https://${options.route}.api.riotgames.com`);
    url.pathname = path

    const apiToken = (await readSecrets()).RIOT_API_KEY;
    let headers = {
        'X-Riot-Token': apiToken,
        'accept': 'application/json'
    }
    let config = {
        'headers': headers
    }

    await rateLimiter.limit();
    return await axios.get(url, config)
        .then((resp) => resp.data);
}

module .exports = {hitRoute}