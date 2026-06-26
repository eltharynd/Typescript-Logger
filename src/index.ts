import chalk from 'chalk'
import JSONLogger from 'node-json-logger'

export interface LoggerConfigs {
	/**
	 * Only logs with level <= of LOG_LEVEL will be printed.
	 */
	LOG_LEVEL: LoggerLevels | string
	/**
	 * Either default 'text' or 'json'
	 */
	LOG_OUTPUT: LoggerOutput
	/**
	 * When true, ignores LOG_LEVEL when printing debugging level logs.
	 *
	 * Useful to quickly enable debug logs when debugging (duh).
	 */
	DEBUGGING: boolean
	/**
	 * This suppresses all the logs.
	 *
	 * The reason why it's called TESTING and not SUPPRESS_ALL_LOGS is because TESTING is what's used by vitest and other unit testing tools.
	 *
	 * Unit tests are exactly the time where you don't want to clog your console with unrelated logs.
	 */
	TESTING: boolean
}

interface LoggerConfigsInternal extends LoggerConfigs {
	LOG_LEVEL: LoggerLevels
}

/**
 * 'test' is default string logs to stdout/stderr.
 *
 * 'json' is used in deployed environments to format output in json so that Promtail/Loki/Grafana Stacks can easily deal with them.
 */
export type LoggerOutput = 'text' | 'json'

/**
 * 'unknown' is not inteded to be used on purpose.
 *
 * It is only assigned whenever something in configuration fails so that it still has a value Grafana can understand, rather than having Grafana try its best and match it at random.
 */
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

	/**
	 * Forces reloading all configs from 'process.env'.
	 *
	 * Useful when you populate environment at runtime after ez-ts-logger is already imported, for example when using 'dotenv'.
	 */
	static reloadEnvConfigs(): void {
		this.config.LOG_LEVEL = determineLogLevel(process.env.LOG_LEVEL || 'info')
		this.config.LOG_OUTPUT = determineLogOutput(
			process.env.LOG_OUTPUT || 'text',
		)
		this.config.DEBUGGING = /true/i.test(process.env.DEBUGGING || 'false')
		this.config.TESTING = /true/i.test(process.env.TESTING || 'false')

		Logger.jsonlogger =
			Logger.config.LOG_OUTPUT === 'json'
				? new JSONLogger({ loggerName: 'node' })
				: null
	}

	/**
	 * Updates the current config.
	 * @param configs - An object with every config you want to change.
	 */
	static changeConfigs(configs: Partial<LoggerConfigs>): void {
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

	/**
	 * Returns all current configs.
	 * @returns The current configuration object, such as active log levels and output format.
	 */
	static currentConfigs(): LoggerConfigs {
		return this.config
	}

	/**
	 * Prints a 'trace' level message.
	 * @params args - Can be a string or a JSON style object
	 */
	static trace(args: string | Record<string, any>): void {
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

	/**
	 * Prints a 'debug' level message.
	 * @params args - Can be a string or a JSON style object
	 */
	static debug(args: string | Record<string, any>): void {
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

	/**
	 * Prints an 'info' level message.
	 *
	 * Same as Logger.info().
	 * @params args - Can be a string or a JSON style object.
	 */
	static log(args: string | Record<string, any>): void {
		return Logger.info(args)
	}

	/**
	 * Prints an 'info' level message.
	 * @params args - Can be a string or a JSON style object.
	 */
	static info(args: string | Record<string, any>): void {
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

	/**
	 * Prints a 'warning' level message.
	 *
	 * Same as Logger.warn().
	 * @params args - Can be a string, a JSON style object, an instance of Error or any CustomError that extends Error.
	 */
	static warning(args: string | Error | Record<string, any>): void {
		return Logger.warn(args)
	}

	/**
	 * Prints a 'warning' level message.
	 * @params args - Can be a string, a JSON style object, an instance of Error or any CustomError that extends Error.
	 */
	static warn(args: string | Error | Record<string, any>): void {
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

	/**
	 * Prints an 'error' level message.
	 * @params args - Can be a string, a JSON style object, an instance of Error or any CustomError that extends Error.
	 */
	static error(args: string | Error | Record<string, any>): void {
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

	/**
	 * Prints an 'error' level message.
	 *
	 * Then throws the provided error.
	 * @params error - Can be an instance of Error or any CustomError that extends Error.
	 */
	static errorAndThrow(error: Error | unknown): void {
		this.error(error)
		throw error
	}

	/**
	 * Print a 'critical' level message.
	 * @params args - Can be a string, a JSON style object, an instance of Error or any CustomError that extends Error.
	 */
	static critical(args: string | Error | Record<string, any>): void {
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
					typeof args === 'string' ? chalk.magentaBright(args) : args,
				)
	}

	/**
	 * Prints a 'critical' level message.
	 *
	 * Then throws the provided error.
	 * @params error - Can be an instance of Error or any CustomError that extends Error.
	 */
	static criticalAndThrow(error: Error | unknown): void {
		this.critical(error)
		throw error
	}
}
