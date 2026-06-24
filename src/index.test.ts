import JSONLogger from 'node-json-logger'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Logger, LoggerConfigs, LoggerLevels } from './index.js'

vi.mock('node-json-logger', () => {
	const MockLogger = vi.fn()

	MockLogger.prototype.trace = vi.fn()
	MockLogger.prototype.debug = vi.fn()
	MockLogger.prototype.info = vi.fn()
	MockLogger.prototype.error = vi.fn()
	MockLogger.prototype.warn = vi.fn()

	return { default: MockLogger }
})

describe('EZ Typescript Logger', () => {
	let conf: LoggerConfigs

	let traceSpy: ReturnType<typeof vi.spyOn>
	let debugSpy: ReturnType<typeof vi.spyOn>
	let infoSpy: ReturnType<typeof vi.spyOn>
	let warnSpy: ReturnType<typeof vi.spyOn>
	let errorSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		vi.clearAllMocks()
		traceSpy = vi.spyOn(console, 'trace').mockImplementation(() => {})
		debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
		infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	describe('Configuration', () => {
		it('Should fetch configs', () => {
			conf = Logger.currentConfigs()

			expect(conf).toBeDefined()
			expect(conf.LOG_LEVEL).toBeDefined()
			expect(conf.LOG_OUTPUT).toBeDefined()
			expect(conf.DEBUGGING).toBeDefined()
			expect(conf.TESTING).toBeDefined()
		})

		it('Should have initialized defaults from empty environment', () => {
			conf = Logger.currentConfigs()

			expect(conf.LOG_LEVEL).toBe(LoggerLevels.info)
			expect(conf.LOG_OUTPUT).toBe('text')
			expect(conf.DEBUGGING).toBe(false)
			expect(conf.TESTING).toBe(false)
		})

		it('Should update all configs', () => {
			Logger.changeConfigs({
				LOG_LEVEL: LoggerLevels.debug,
				LOG_OUTPUT: 'json',
				DEBUGGING: true,
				TESTING: true,
			})

			conf = Logger.currentConfigs()
			expect(conf.LOG_LEVEL).toBe(LoggerLevels.debug)
			expect(conf.LOG_OUTPUT).toBe('json')
			expect(conf.DEBUGGING).toBe(true)
			expect(conf.TESTING).toBe(true)

			Logger.changeConfigs({
				LOG_LEVEL: LoggerLevels.info,
				LOG_OUTPUT: 'text',
				DEBUGGING: false,
				TESTING: false,
			})
		})

		it('Should update LOG_LEVEL', () => {
			Logger.changeConfigs({ LOG_LEVEL: '' })
			expect(Logger.currentConfigs().LOG_LEVEL).toBe(LoggerLevels.unknown)

			Logger.changeConfigs({ LOG_LEVEL: 'info' })
			expect(Logger.currentConfigs().LOG_LEVEL).toBe(LoggerLevels.info)
		})

		it('Should update LOG_OUTPUT', () => {
			Logger.changeConfigs({ LOG_OUTPUT: 'json' })
			expect(Logger.currentConfigs().LOG_OUTPUT).toBe('json')

			Logger.changeConfigs({ LOG_OUTPUT: 'text' })
		})

		it('Should update DEBUGGING', () => {
			Logger.changeConfigs({ DEBUGGING: true })
			expect(Logger.currentConfigs().DEBUGGING).toBe(true)

			Logger.changeConfigs({ DEBUGGING: false })
		})

		it('Should update TESTING', () => {
			Logger.changeConfigs({ TESTING: true })
			expect(Logger.currentConfigs().TESTING).toBe(true)

			Logger.changeConfigs({ TESTING: false })
		})

		it('Should bypass because DEBUGGING', () => {
			Logger.debug('Test')
			expect(debugSpy).toHaveBeenCalledTimes(0)

			Logger.changeConfigs({ DEBUGGING: true })
			Logger.debug('Test')
			expect(debugSpy).toHaveBeenCalledTimes(1)

			Logger.changeConfigs({ DEBUGGING: false })
		})

		it('Should suppress because of TESTING', () => {
			Logger.info('Test')
			expect(infoSpy).toHaveBeenCalledTimes(1)

			Logger.changeConfigs({ TESTING: true })
			Logger.info('Test')
			expect(infoSpy).toHaveBeenCalledTimes(1)

			Logger.changeConfigs({ TESTING: false })
		})
	})

	describe('Log levels', () => {
		beforeAll(() => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.trace })
		})

		it('Should print all levels', () => {
			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(1)
			expect(debugSpy).toHaveBeenCalledTimes(1)
			expect(infoSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(errorSpy).toHaveBeenCalledTimes(2)
		})

		it('Should print debug and above', () => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.debug })

			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(0)
			expect(debugSpy).toHaveBeenCalledTimes(1)
			expect(infoSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(errorSpy).toHaveBeenCalledTimes(2)
		})

		it('Should print info and above', () => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.info })

			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(0)
			expect(debugSpy).toHaveBeenCalledTimes(0)
			expect(infoSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(errorSpy).toHaveBeenCalledTimes(2)
		})

		it('Should print warn and above', () => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.warning })

			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(0)
			expect(debugSpy).toHaveBeenCalledTimes(0)
			expect(infoSpy).toHaveBeenCalledTimes(0)
			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(errorSpy).toHaveBeenCalledTimes(2)
		})

		it('Should print error and above', () => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.error })

			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(0)
			expect(debugSpy).toHaveBeenCalledTimes(0)
			expect(infoSpy).toHaveBeenCalledTimes(0)
			expect(warnSpy).toHaveBeenCalledTimes(0)
			expect(errorSpy).toHaveBeenCalledTimes(2)
		})

		it('Should print info and above', () => {
			Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.critical })

			Logger.trace('A text message')
			Logger.debug('A text message')
			Logger.info('A text message')
			Logger.warn('A text message')
			Logger.error('A text message')
			Logger.critical('A text message')

			expect(traceSpy).toHaveBeenCalledTimes(0)
			expect(debugSpy).toHaveBeenCalledTimes(0)
			expect(infoSpy).toHaveBeenCalledTimes(0)
			expect(warnSpy).toHaveBeenCalledTimes(0)
			expect(errorSpy).toHaveBeenCalledTimes(1)
		})
	})

	describe('Text output', () => {
		beforeAll(() => {
			Logger.changeConfigs({
				LOG_OUTPUT: 'text',
				LOG_LEVEL: LoggerLevels.trace,
			})
		})

		it('Should print all levels', () => {
			Logger.trace('trace')
			Logger.debug('debug')
			Logger.info('info')
			Logger.warn('warning')
			Logger.error('error')
			Logger.critical('critical')

			expect(traceSpy).toHaveBeenCalledTimes(1)
			expect(traceSpy).toHaveBeenCalledWith(
				expect.stringContaining('TRACE'),
				expect.stringContaining('trace'),
			)

			expect(debugSpy).toHaveBeenCalledTimes(1)
			expect(debugSpy).toHaveBeenCalledWith(
				expect.stringContaining('DEBUG'),
				expect.stringContaining('debug'),
			)

			expect(infoSpy).toHaveBeenCalledTimes(1)
			expect(infoSpy).toHaveBeenCalledWith(
				expect.stringContaining('INFO'),
				expect.stringContaining('info'),
			)

			expect(warnSpy).toHaveBeenCalledTimes(1)
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining('WARN'),
				expect.stringContaining('warning'),
			)

			expect(errorSpy).toHaveBeenCalledTimes(2)
			expect(errorSpy).toHaveBeenCalledWith(
				expect.stringContaining('ERROR'),
				expect.stringContaining('error'),
			)
			expect(errorSpy).toHaveBeenCalledWith(
				expect.stringContaining('CRIT'),
				expect.stringContaining('critical'),
			)
		})

		describe('String Message', () => {
			beforeAll(() => {
				Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.trace })
			})

			it('Should print all levels', () => {
				Logger.trace('trace')
				Logger.debug('debug')
				Logger.info('info')
				Logger.warn('warning')
				Logger.error('error')
				Logger.critical('critical')

				expect(traceSpy).toHaveBeenCalledTimes(1)
				expect(traceSpy).toHaveBeenCalledWith(
					expect.stringContaining('TRACE'),
					expect.stringContaining('trace'),
				)

				expect(debugSpy).toHaveBeenCalledTimes(1)
				expect(debugSpy).toHaveBeenCalledWith(
					expect.stringContaining('DEBUG'),
					expect.stringContaining('debug'),
				)

				expect(infoSpy).toHaveBeenCalledTimes(1)
				expect(infoSpy).toHaveBeenCalledWith(
					expect.stringContaining('INFO'),
					expect.stringContaining('info'),
				)

				expect(warnSpy).toHaveBeenCalledTimes(1)
				expect(warnSpy).toHaveBeenCalledWith(
					expect.stringContaining('WARN'),
					expect.stringContaining('warning'),
				)

				expect(errorSpy).toHaveBeenCalledTimes(2)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('ERROR'),
					expect.stringContaining('error'),
				)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('CRIT'),
					expect.stringContaining('critical'),
				)
			})
		})

		describe('Object Message', () => {
			beforeAll(() => {
				Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.trace })
			})

			it('Should print all levels', () => {
				Logger.trace({ level: 'trace' })
				Logger.debug({ level: 'debug' })
				Logger.info({ level: 'info' })
				Logger.warn({ level: 'warning' })
				Logger.error({ level: 'error' })
				Logger.critical({ level: 'critical' })

				expect(traceSpy).toHaveBeenCalledTimes(1)
				expect(traceSpy).toHaveBeenCalledWith(
					expect.stringContaining('TRACE'),
					expect.objectContaining({ level: 'trace' }),
				)

				expect(debugSpy).toHaveBeenCalledTimes(1)
				expect(debugSpy).toHaveBeenCalledWith(
					expect.stringContaining('DEBUG'),
					expect.objectContaining({ level: 'debug' }),
				)

				expect(infoSpy).toHaveBeenCalledTimes(1)
				expect(infoSpy).toHaveBeenCalledWith(
					expect.stringContaining('INFO'),
					expect.objectContaining({ level: 'info' }),
				)

				expect(warnSpy).toHaveBeenCalledTimes(1)
				expect(warnSpy).toHaveBeenCalledWith(
					expect.stringContaining('WARN'),
					expect.objectContaining({ level: 'warning' }),
				)

				expect(errorSpy).toHaveBeenCalledTimes(2)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('ERROR'),
					expect.objectContaining({ level: 'error' }),
				)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('CRIT'),
					expect.objectContaining({ level: 'critical' }),
				)
			})
		})

		describe('Object with message field', () => {
			beforeAll(() => {
				Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.trace })
			})

			it('Should print all levels', () => {
				Logger.trace({ level: 'trace', message: 'trace message' })
				Logger.debug({ level: 'debug', message: 'debug message' })
				Logger.info({ level: 'info', message: 'info message' })
				Logger.warn({ level: 'warning', message: 'warning message' })
				Logger.error({ level: 'error', message: 'error message' })
				Logger.critical({ level: 'critical', message: 'critical message' })

				expect(traceSpy).toHaveBeenCalledTimes(1)
				expect(traceSpy).toHaveBeenCalledWith(
					expect.stringContaining('trace message'),
					expect.objectContaining({ level: 'trace' }),
				)

				expect(debugSpy).toHaveBeenCalledTimes(1)
				expect(debugSpy).toHaveBeenCalledWith(
					expect.stringContaining('debug message'),
					expect.objectContaining({ level: 'debug' }),
				)

				expect(infoSpy).toHaveBeenCalledTimes(1)
				expect(infoSpy).toHaveBeenCalledWith(
					expect.stringContaining('info message'),
					expect.objectContaining({ level: 'info' }),
				)

				expect(warnSpy).toHaveBeenCalledTimes(1)
				expect(warnSpy).toHaveBeenCalledWith(
					expect.stringContaining('warning message'),
					expect.objectContaining({ level: 'warning' }),
				)

				expect(errorSpy).toHaveBeenCalledTimes(2)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('error message'),
					expect.objectContaining({ level: 'error' }),
				)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('critical message'),
					expect.objectContaining({ level: 'critical' }),
				)
			})
		})

		describe('Error Messages', () => {
			beforeAll(() => {
				Logger.changeConfigs({ LOG_LEVEL: LoggerLevels.warning })
			})

			it('Should print all levels', () => {
				Logger.warn(new CustomError('My Warning'))
				Logger.error(new CustomError('My Error'))
				Logger.critical(new CustomError('My Critical'))
				Logger.critical('critical')

				expect(warnSpy).toHaveBeenCalled()
				expect(warnSpy).toHaveBeenCalledWith(
					expect.stringContaining('WARN'),
					expect.stringContaining('CustomError: My Warning'),
				)

				expect(errorSpy).toHaveBeenCalled()
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('ERROR'),
					expect.stringContaining('CustomError: My Error'),
				)
				expect(errorSpy).toHaveBeenCalledWith(
					expect.stringContaining('CRIT'),
					expect.stringContaining('CustomError: My Critical'),
				)
			})
		})
	})

	describe('JSON output', () => {
		beforeAll(() => {
			Logger.changeConfigs({
				LOG_OUTPUT: 'json',
				LOG_LEVEL: LoggerLevels.trace,
			})
		})

		it('Should print all levels', () => {
			Logger.trace({ level: 'trace', message: 'my trace message' })
			Logger.debug({ level: 'debug', message: 'my debug message' })
			Logger.info({ level: 'info', message: 'my info message' })
			Logger.warn({ level: 'warning', message: 'my warning message' })
			Logger.error({ level: 'error', message: 'my error message' })
			Logger.critical({ level: 'critical', message: 'my critical message' })

			expect(JSONLogger.prototype.trace).toHaveBeenCalledTimes(1)
			expect(JSONLogger.prototype.trace).toHaveBeenCalledWith({
				level: 'trace',
				message: 'my trace message',
			})

			expect(JSONLogger.prototype.debug).toHaveBeenCalledTimes(1)
			expect(JSONLogger.prototype.debug).toHaveBeenCalledWith({
				level: 'debug',
				message: 'my debug message',
			})

			expect(JSONLogger.prototype.info).toHaveBeenCalledTimes(1)
			expect(JSONLogger.prototype.info).toHaveBeenCalledWith({
				level: 'info',
				message: 'my info message',
			})
			expect(JSONLogger.prototype.warn).toHaveBeenCalledTimes(1)
			expect(JSONLogger.prototype.warn).toHaveBeenCalledWith({
				level: 'warning',
				message: 'my warning message',
			})

			expect(JSONLogger.prototype.error).toHaveBeenCalledTimes(2)
			expect(JSONLogger.prototype.error).toHaveBeenCalledWith({
				level: 'error',
				message: 'my error message',
			})
			expect(JSONLogger.prototype.error).toHaveBeenCalledWith({
				level: 'critical',
				message: 'my critical message',
			})
		})
	})
})

class CustomError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options)
		this.name = 'CustomError'
	}
}
