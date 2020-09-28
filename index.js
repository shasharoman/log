const fs = require('fs');
const p = require('path');
const util = require('util');

const LEVEL = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

function mkdir(dir) {
    if (fs.existsSync(dir)) {
        return;
    }

    let parent = p.dirname(dir);
    if (!fs.existsSync()) {
        mkdir(parent);
    }

    fs.mkdirSync(dir);
}

class Logger {
    constructor(label, transports = []) {
        this.label = label;
        this.transports = transports;
    }

    debug(...args) {
        this._log('DEBUG', ...args);
    }

    info(...args) {
        this._log('INFO', ...args);
    }

    warn(...args) {
        this._log('WARN', ...args);
    }

    error(...args) {
        this._log('ERROR', ...args);
    }

    duplicate(label) {
        return new Logger(label, this.transports);
    }

    _log(level, ...args) {
        let label = this.label;
        if (!label) {
            label = new Error().stack.split('\n')[3].replace(/[^/]+(.+\d+:\d+).*/, '$1');
        }

        if (this.transports.length === 0) {
            console.log(ts, `[${level}]`, `[${label}]`, ...args);
            return;
        }

        let now = new Date();
        let year = now.getFullYear();
        let month = ((now.getMonth() + 1) + '').padStart(2, '0');
        let day = (now.getDate() + '').padStart(2, '0');
        let hour = now.getHours();
        let minute = (now.getMinutes() + '').padStart(2, '0');
        let seconds = (now.getSeconds() + '').padStart(2, '0');
        let ts = `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;

        for (let item of this.transports) {
            item.log(LEVEL[level], ts, `[${level}]`, `[${label}]`, ...args);
        }
    }
}

class FileTransport {
    constructor(level, path, opts = {}) {
        mkdir(p.dirname(path));

        this.level = LEVEL[level] || 0;
        this.path = path;

        this.pause = false;
        this.buffer = [];

        if (opts.rotate) {
            this._initRotate(opts.rotate);
        }
        this._openStream(path);
    }

    _initRotate(opts) {
        let {
            suffixFn,
            interval = 300000 // 5min
        } = opts;

        if (!suffixFn) {
            suffixFn = () => {
                let now = new Date();
                let year = (now.getFullYear() + '').substr(2);
                let month = ((now.getMonth() + 1) + '').padStart(2, '0');
                let day = (now.getDate() + '').padStart(2, '0');

                return `${year}${month}${day}`;
            };
        }

        let timer = setInterval(() => {
            let suffix = suffixFn();
            if (this.suffix === suffix) {
                return;
            }

            this.suffix = suffix;
            this._reopenStream();
        }, interval);
        timer.unref();

        this.suffix = suffixFn();
    }

    _openStream() {
        let path = this.path + (this.suffix ? `.${this.suffix}` : '');

        this.stream = fs.createWriteStream(path, {
            flags: 'a',
            encoding: 'utf8'
        });
        this.stream.on('drain', () => {
            this.pause = false;
            this._write();
        });
    }

    _reopenStream() {
        this.stream.close();
        this.stream = null;
        this.pause = false;

        this._openStream();
    }

    _write() {
        if (this.pause || !this.stream) {
            return;
        }

        let items = this.buffer.splice(0, this.buffer.length);
        if (items.length === 0) {
            return;
        }

        this.pause = !this.stream.write(items.join('\n'), 'utf8');
    }

    log(level = 0, ...args) {
        if (level > this.level) {
            return;
        }

        let format = args.map(item => {
            if (typeof item === 'string') {
                return item;
            }

            if (typeof item === 'number') {
                return `number:${item}`;
            }

            return util.inspect(item, {
                depth: 4
            });
        });

        this.buffer.push(format.join(' ') + '\n');
        this._write();
    }
}

class ConsoleTransport {
    constructor(level) {
        this.level = LEVEL[level] || 0;
    }

    log(level = 0, ...args) {
        if (level > this.level) {
            return;
        }

        let format = args.map(item => {
            if (typeof item === 'string') {
                return item;
            }

            if (typeof item === 'number') {
                return `number:${item}`;
            }

            return util.inspect(item, {
                depth: 4
            });
        });

        console.log(format.join(' '));
    }
}

exports.ConsoleTransport = ConsoleTransport;
exports.FileTransport = FileTransport;
exports.Logger = Logger;