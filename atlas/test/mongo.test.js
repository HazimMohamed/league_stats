const mongoUnit = require('mongo-unit');

exports.mochaGlobalSetup = async function () {
    console.log('Starting test MongoDB...');
    await mongoUnit.start().then(() => {
        process.env.TEST_MONGO_URL = mongoUnit.getUrl();
        console.log(`Successfully started at ${mongoUnit.getUrl()}.`);
    });
};

exports.mochaGlobalTeardown = async function () {
    console.log(`Stopped test MongoDB at ${mongoUnit.getUrl()}`);
    await mongoUnit.stop();
};
