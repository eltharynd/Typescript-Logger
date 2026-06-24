import { Logger, LoggerLevels } from './index.js'

class CustomError extends Error {
	constructor(message?: string, options?: { cause?: unknown }) {
		super(message, options)
		this.name = 'CustomError'
	}
}

const start = () => {
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
}

start()
