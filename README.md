# EZ Typescript Logger

[![GitHub Release](https://img.shields.io/github/v/release/eltharynd/ez-ts-logger?style=flat-square)](https://github.com/eltharynd/ez-ts-logger/releases)
![GitHub Issues](https://img.shields.io/github/issues/eltharynd/onepacerr?style=flat-square)
![GitHub Last Commit](https://img.shields.io/github/last-commit/eltharynd/onepacerr?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]

A simple to use, yet professional looking Logger for Typescript.

Supports json formatting for scraping the logs with Promtail for Loki/Grafana Stacks.

## Install

```console
npm i -S ez-ts-logger
```

## Usage

```typescript
import { Logger} from 'ez-ts-logger'

Logger.debug('A Debugging message')
Logger.info({
  Hello: 'World!',
  foo: {
    bar: true,
  },
})
Logger.warn('A Warning message')

Logger.error('An Error message')
Logger.error(new Error())

try {
  Logger.errorAndThrow(new CustomError('Some Message'))
} catch (e) {
  Logger.info('Caught')
}
```

![Short example output](docs/short.png)

## Configuration

EZ Typescript Logger automatically gets its configuration from env vars (or default if undefined)

```dotenv
# 'trace', 'debug', 'info', 'warning', 'error' or 'critical'
LOG_LEVEL=info

# 'text', 'json' (json formatting for Loki/Promtail/Grafana and such)
LOG_OUTPUT=text

# If 'true', ignores log level when printing 'debug' message (always prints it)
DEBUGGING=false

# If 'true', will suppress all logs (used when running unit test)
TESTING=false
```

## Full Showcase

```typescript
const object = {
  created: new Date(),
  data: 123,
  more: {
    hello: 'world',
  },
}
const objectWithMessage = {
  message: 'My Message',
  created: new Date(),
  data: 123,
  more: {
    hello: 'world!',
  },
}

const error = new CustomError('Nothing actually happened')

//Just some spacing for readibility
console.log()
console.log()

Logger.info('Before config update')
Logger.info(object)
Logger.info(objectWithMessage)

Logger.changeConfigs({ LOG_OUTPUT: 'json', LOG_LEVEL: LoggerLevels.trace })
console.log()
console.log()

Logger.info('json formatting')
Logger.info(objectWithMessage)

console.log()
console.log()

Logger.changeConfigs({ LOG_OUTPUT: 'text' })

Logger.trace('After config update')
console.log()

Logger.debug('A Debugging message')
console.log()

Logger.info('An Info message')
console.log()

Logger.warn('A Warning message')
Logger.warn(objectWithMessage)
Logger.warn(error)
console.log()

Logger.error('An Error message')
Logger.error(objectWithMessage)
Logger.error(error)
console.log()

Logger.critical('A Critical message')
Logger.critical(objectWithMessage)
Logger.critical(error)
console.log()

try {
  Logger.errorAndThrow(error)
} catch (e) {
  Logger.info(`Appplication failed successfully`)
} finally {
  console.log()
}

try {
  Logger.criticalAndThrow(error)
} catch (e) {
  Logger.info(`Appplication failed successfully`)
} finally {
  console.log()
}
```

![Showcase output](docs/showcase.png)

[npm-version-image]: https://badgen.net/npm/v/ez-ts-logger
[npm-url]: https://npmjs.org/package/ez-ts-logger

[npm-install-size-image]: https://badgen.net/packagephobia/install/ez-ts-logger
[npm-install-size-url]: https://packagephobia.com/result?p=ez-ts-logger

[npm-downloads-image]: https://badgen.net/npm/dm/ez-ts-logger
[npm-downloads-url]: https://npmcharts.com/compare/ez-ts-logger?minimal=true
