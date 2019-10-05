const log = require('../');
const fs = require('fs');
const p = require('path');
const expect = require('chai').expect;

const logPath = p.resolve(__dirname, 'log');

before(() => {
    fs.existsSync(logPath) && fs.unlinkSync(logPath);
});

describe('logger', () => {
    it('level, debug', async () => {
        let logger = new log.Logger('label', [
            new log.FileTransport('INFO', logPath)
        ]);

        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        logger.error('error');

        await new Promise(resolve => setTimeout(resolve, 10));

        let lines = fs.readFileSync(logPath).toString().split('\n');
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[INFO\] \[label\] info$/.test(lines[0])).to.be.equal(true);
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[WARN\] \[label\] warn/.test(lines[1])).to.be.equal(true);
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[ERROR\] \[label\] error/.test(lines[2])).to.be.equal(true);
    });
});

after(() => {
    fs.existsSync(logPath) && fs.unlinkSync(logPath);
});