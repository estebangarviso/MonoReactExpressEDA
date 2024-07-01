/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import logger from 'loglevel'
import chalk from 'chalk'
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'
const APP_NAME = process.env.APP_NAME
logger.setLevel(LOG_LEVEL)

console.log = function (message, ...optionalParams) {
  logger.info(chalk.green(`[${APP_NAME}] `, message), ...optionalParams)
}

console.info = function (message, ...optionalParams) {
  logger.info(chalk.cyan(`[${APP_NAME}]  `, message), ...optionalParams)
}

console.error = function (message, ...optionalParams) {
  logger.error(chalk.red(`[${APP_NAME}] 🔴 `, message), ...optionalParams)
}

console.success = function (message, ...optionalParams) {
  logger.info(chalk.greenBright(`[${APP_NAME}] 🟢 `, message), ...optionalParams)
}

console.warn = function (message, ...optionalParams) {
  logger.warn(chalk.yellow(`[${APP_NAME}] 🟡 `, message), ...optionalParams)
}

console.debug = function (message, ...optionalParams) {
  // trace where the log is coming from
  const stack = new Error().stack
  const callers = stack?.split('at ')
  let traceString = ''
  if (callers && callers.length > 2)
    for (let i = 2; i < callers.length; i++)
      // exclude node_modules
      if (!callers[i].includes('node_modules'))
        traceString += `\r    at ${callers[i]}`

  logger.debug(
    chalk.magenta(`[${APP_NAME}] 🟣 `, message),
    ...optionalParams,
    `\n${traceString}`
  )
}
