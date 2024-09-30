const {readConfig} = require('./config');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const envalid = require('envalid');

async function initLogging() {
    let {LOG_FOLDER: logDirectory, TIMEZONE: timeZone} = await readConfig();
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory, {
            recursive: true,
        });
    }

    // reads RIOT_SCRAPER_DEVEL in an intuitively typed way
    const {WRITE_RIOT_LOGS: writingLogs} = envalid.cleanEnv(process.env, {
        WRITE_RIOT_LOGS: envalid.bool({default: false})
    });

    console.log(`Is logging to file? ${writingLogs}`);
    const transports = [];
    if (writingLogs) {
        let humanDateTime = new Date(Date.now()).toLocaleString({timeZone: timeZone})
            .replaceAll(/[^a-zA-Z0-9]/g, '_');
        const logFileName = path.join(logDirectory, `riot-scraper-${humanDateTime}.log`);
        const myFormat = winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level}]: ${message}`;
        });
        transports.push(new winston.transports.File({
            filename: logFileName,
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                myFormat
            )
        }));
    } else {
        transports.push(new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.cli()
        }));
    }
    global.logger = winston.createLogger({
        transports: transports,
        exitOnError: false
    });
}

module.exports = {initLogging};