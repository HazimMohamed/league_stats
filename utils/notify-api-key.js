const {MongoHandle} = require('../lib/mongo');
const winston = require('winston');
const flags = require('flags');

flags.defineBoolean('printLastUpdated', true, 'Whether or not to print last modified date');

(async () => {
    const mongo = new MongoHandle();
    await mongo.init();
    winston.add(new winston.transports.Console({
        format: winston.format.cli()
    }));
    flags.parse();

    try {
        if (flags.get('printLastUpdated')) {
            const lastUpdated = await mongo.getLastUpdated();
            winston.info(`Riot data last updated: ${lastUpdated.toLocaleString()}`);
        }
        if (!await mongo.isApiKeyValid()) {
            winston.warn('Riot API key expired. No longer scraping their servers.');
        }
    } finally {
        await mongo.close();
    }
})();