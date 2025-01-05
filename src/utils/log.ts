import path from 'path'

import Logger from '@/utils/logger'

interface LogData {
  [key: string]: any
}

function getCallerFile() {
  const err = new Error()
  Error.prepareStackTrace = (_, stack) => stack
  const stack = err.stack as unknown as NodeJS.CallSite[]
  Error.prepareStackTrace = undefined
  const callerFile = stack[2].getFileName()
  return callerFile ? path.basename(callerFile) : 'Unknown'
}

export function logError(message: string, error?: Error, data?: LogData) {
  const fileName = getCallerFile()
  Logger.error(`${message}${error ? `: ${error.message}` : ''}`, {
    ...(data || {}),
    stack: error?.stack,
    fileName
  })
}

export function logWarning(message: string, data?: LogData) {
  const fileName = getCallerFile()
  Logger.warn(message, { ...(data || {}), fileName })
}

export function logInfo(message: string, data?: LogData) {
  const fileName = getCallerFile()
  Logger.info(message, { ...(data || {}), fileName })
}

export function logDebug(message: string, data?: LogData) {
  const fileName = getCallerFile()
  Logger.debug(message, { ...(data || {}), fileName })
}

export function logVerbose(message: string, data?: LogData) {
  const fileName = getCallerFile()
  Logger.verbose(message, { ...(data || {}), fileName })
}

export function logHttp(message: string, data?: LogData) {
  const fileName = getCallerFile()
  Logger.http(message, { ...(data || {}), fileName })
}
