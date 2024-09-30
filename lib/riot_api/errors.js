class ExpiredApiKeyError extends Error {
    constructor(apiKey) {
        apiKey ??= '';
        super(`Expired riot API key: ${apiKey}`);
        this.apiKey = apiKey;
    }
}

module.exports = {ExpiredApiKeyError}