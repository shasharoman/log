const log = require('../');
const fs = require('fs');
const p = require('path');
const expect = require('chai').expect;

const logPath = p.resolve(__dirname, 'log');

before(() => {
    fs.existsSync(logPath) && fs.unlinkSync(logPath);
    for (let i = 1; i < 10; i++) {
        fs.existsSync(`${logPath}.${i}`) && fs.unlinkSync(`${logPath}.${i}`);
    }
});

describe('logger', () => {
    it('level', async () => {
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

    it('rotate', async () => {
        let i = 1;
        let opts = {
            rotate: {
                interval: 3,
                suffixFn: () => i
            }
        };
        let logger = new log.Logger('label', [
            new log.FileTransport('DEBUG', logPath, opts)
        ]);

        logger.debug('debug');
        i++;
        await new Promise(resolve => setTimeout(resolve, 10));

        logger.info('info');
        i++;
        await new Promise(resolve => setTimeout(resolve, 10));

        logger.warn('warn');
        i++;
        await new Promise(resolve => setTimeout(resolve, 10));

        logger.error('error');
        i++;
        await new Promise(resolve => setTimeout(resolve, 10));

        await new Promise(resolve => setTimeout(resolve, 10));
        let debug = fs.readFileSync(`${logPath}.1`).toString().split('\n');
        let info = fs.readFileSync(`${logPath}.2`).toString().split('\n');
        let warn = fs.readFileSync(`${logPath}.3`).toString().split('\n');
        let error = fs.readFileSync(`${logPath}.4`).toString().split('\n');

        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[DEBUG\] \[label\] debug/.test(debug[0])).to.be.equal(true);
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[INFO\] \[label\] info$/.test(info[0])).to.be.equal(true);
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[WARN\] \[label\] warn/.test(warn[0])).to.be.equal(true);
        expect(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[ERROR\] \[label\] error/.test(error[0])).to.be.equal(true);
    });
});

after(() => {
    fs.existsSync(logPath) && fs.unlinkSync(logPath);

    for (let i = 1; i < 10; i++) {
        fs.existsSync(`${logPath}.${i}`) && fs.unlinkSync(`${logPath}.${i}`);
    }
});