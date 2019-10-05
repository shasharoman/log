LOG
===

LOG is logger with simplest features.

Examples
--------

### file log

``` {.javascript}
const log = require('log');

let logger = new log.Logger('label', [
    new log.ConsoleTransport('DEBUG'),
    new log.FileTransport('INFO', './log')
]);

logger.debug('debug');
logger.info('info');
logger.warn('wran');
logger.error('error');
```

`./log` file's content:

``` {.text}
2019-10-05 23:00:00 [INFO] [label] info
2019-10-05 23:00:00 [WARN] [label] wran
2019-10-05 23:00:00 [ERROR] [label] error
```
