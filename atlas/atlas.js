// This code runs as a trigger on Atlas whenever a new document gets added to the matches_raw collection

const lib = require('./process');
const {processNewMatch} = require("./process");

// entry point
exports = async function (changeEvent) {
    await processNewMatch(context.services
        .get("mongodb-atlas").db('league_matches'), changeEvent.fullDocument);
};