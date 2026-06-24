import chalk from 'chalk'
import JSONLogger from 'node-json-logger'

export interface LoggerConfigs {
	LOG_LEVEL: LoggerLevels | string
	LOG_OUTPUT: LoggerOutput
	DEBUGGING: boolean
	TESTING: boolean
}

interface LoggerConfigsInternal extends LoggerConfigs {
	LOG_LEVEL: LoggerLevels
}

export type LoggerOutput = 'text' | 'json'

export enum LoggerLevels {
	'unknown',
	'trace',
	'debug',
	'info',
	'warning',
	'error',
	'critical',
}

const determineLogLevel = (level: string) => {
	switch (level) {
		case 'critical':
			return LoggerLevels.critical
		case 'error':
			return LoggerLevels.error
		case 'warning':
			return LoggerLevels.warning
		case 'info':
			return LoggerLevels.info
		case 'debug':
			return LoggerLevels.debug
		case 'trace':
			return LoggerLevels.trace
		default:
			return LoggerLevels.unknown
	}
}

const determineLogOutput = (output: string): LoggerOutput => {
	switch (output) {
		case 'json':
			return 'json'
		default:
			return 'text'
	}
}

export class Logger {
	private static readonly config: LoggerConfigsInternal = {
		LOG_LEVEL: determineLogLevel(process.env.LOG_LEVEL || 'info'),
		LOG_OUTPUT: determineLogOutput(process.env.LOG_OUTPUT || 'text'),
		DEBUGGING: /true/i.test(process.env.DEBUGGING || 'false'),
		TESTING: /true/i.test(process.env.TESTING || 'false'),
	}
	private static jsonlogger =
		Logger.config.LOG_OUTPUT === 'json'
			? new JSONLogger({ loggerName: 'node' })
			: null

	static changeConfigs(configs: Partial<LoggerConfigs>) {
		for (let key of Object.keys(configs)) {
			if (key == 'LOG_LEVEL') {
				if (typeof configs[key] === 'string')
					Logger.config[key] = determineLogLevel(configs[key])
				else Logger.config[key] = configs[key]
			} else if (key == 'LOG_OUTPUT') {
				Logger.config[key] = determineLogOutput(configs[key])
				Logger.jsonlogger =
					Logger.config.LOG_OUTPUT === 'json'
						? new JSONLogger({ loggerName: 'node' })
						: null
			} else {
				Logger.config[key] = configs[key]
			}
		}
	}

	static currentConfigs(): LoggerConfigs {
		return this.config
	}

	static trace(args: string | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (Logger.config.LOG_LEVEL <= LoggerLevels.trace)
			if (Logger.jsonlogger) {
				Logger.jsonlogger.trace(args)
			} else {
				console.trace(
					chalk.gray(
						`[${new Date().toLocaleString()}] [TRACE] -${typeof args !== 'string' && args.message ? ` ${args.message} ` : ''}`,
					),
					typeof args === 'string' ? chalk.gray(args) : args,
				)
			}
	}

	static debug(args: string | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (
			Logger.config.LOG_LEVEL <= LoggerLevels.debug ||
			Logger.config.DEBUGGING
		)
			if (Logger.jsonlogger) {
				Logger.jsonlogger.debug(args)
			} else {
				console.debug(
					chalk.green(
						`[${new Date().toLocaleString()}] [DEBUG] -${typeof args !== 'string' && args.message ? ` ${args.message} ` : ''}`,
					),
					typeof args === 'string' ? chalk.greenBright(args) : args,
				)
			}
	}

	static log(args: string | Record<string, any>) {
		return Logger.info(args)
	}

	static info(args: string | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (Logger.config.LOG_LEVEL <= LoggerLevels.info)
			if (Logger.jsonlogger) {
				Logger.jsonlogger.info(args)
			} else {
				console.info(
					chalk.blue(
						`[${new Date().toLocaleString()}] [INFO] -${typeof args !== 'string' && args.message ? ` ${args.message}` : ''}`,
					),
					typeof args === 'string' ? chalk.blueBright(args) : args,
				)
			}
	}

	static warn(args: string | Error | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (Logger.config.LOG_LEVEL <= LoggerLevels.warning)
			if (Logger.jsonlogger) {
				if (args instanceof Error && args?.stack)
					Logger.jsonlogger.warn(args.stack)
				else Logger.jsonlogger.warn(args)
			} else if (args instanceof Error && args?.stack) {
				let lines: string[] = args.stack.split('\n')
				console.warn(
					chalk.yellow(`[${new Date().toLocaleString()}] [WARN] -`),
					chalk.yellowBright(`${lines.splice(0, 1)[0]}`),
				)
				for (let line of lines) console.warn(chalk.yellowBright(line))
			} else {
				console.warn(
					chalk.yellow(
						`[${new Date().toLocaleString()}] [WARN] -${typeof args !== 'string' && args.message ? ` ${args.message} ` : ''}`,
					),
					typeof args === 'string' ? chalk.yellowBright(args) : args,
				)
			}
	}

	static error(args: string | Error | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (Logger.config.LOG_LEVEL <= LoggerLevels.error)
			if (Logger.jsonlogger) {
				if (args instanceof Error && args?.stack)
					Logger.jsonlogger.error(args.stack)
				else Logger.jsonlogger.error(args)
			} else if (args instanceof Error && args?.stack) {
				let lines: string[] = args.stack.split('\n')
				console.error(
					chalk.red(`[${new Date().toLocaleString()}] [ERROR] -`),
					chalk.redBright(`${lines.splice(0, 1)[0]}`),
				)
				for (let line of lines) console.error(chalk.redBright(line))
			} else
				console.error(
					chalk.red(
						`[${new Date().toLocaleString()}] [ERROR] -${typeof args !== 'string' && args.message ? ` ${args.message} ` : ''}`,
					),
					typeof args === 'string' ? chalk.redBright(args) : args,
				)
	}

	static errorAndThrow(error: Error) {
		this.error(error)
		throw error
	}

	static critical(args: string | Error | Record<string, any>) {
		if (Logger.config.TESTING) return
		if (Logger.config.LOG_LEVEL <= LoggerLevels.critical)
			if (Logger.jsonlogger) {
				if (args instanceof Error && args?.stack)
					Logger.jsonlogger.error(args.stack)
				else Logger.jsonlogger.error(args)
			} else if (args instanceof Error && args?.stack) {
				let lines: string[] = args.stack.split('\n')
				console.error(
					chalk.magenta(`[${new Date().toLocaleString()}] [CRIT] -`),
					chalk.magentaBright(`${lines.splice(0, 1)[0]}`),
				)
				for (let line of lines) console.error(chalk.magentaBright(line))
			} else
				console.error(
					chalk.magenta(
						`[${new Date().toLocaleString()}] [CRIT] -${typeof args !== 'string' && args.message ? ` ${args.message} ` : ''}`,
					),
					typeof args === 'string' ? chalk.redBright(args) : args,
				)
	}

	static criticalAndThrow(error: Error) {
		this.critical(error)
		throw error
	}
}
