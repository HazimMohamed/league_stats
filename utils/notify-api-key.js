const {MongoHandle} = require('../lib/mongo');
const winston = require('winston');

(async () => {
    const mongo = new MongoHandle();
    let isApiKeyValid;
    try {
        await mongo.init();
        isApiKeyValid = await mongo.isApiKeyValid();
    } finally {
        await mongo.close();
    }
    if (!isApiKeyValid) {
        winston.add(new winston.transports.Console({
            format: winston.format.cli()
        }));
        winston.warn('Riot API key expired. No longer scraping their servers.');
    }
})();