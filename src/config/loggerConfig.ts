export const loggerConfig = {
  logFolder: process.env.LOG_FOLDER_PATH || './logs',
  maxLogSize: parseInt(process.env.LOG_FILE_MAX_SIZE || '10485760'),
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  level: (process.env.LOG_LEVEL || 'info') as 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly',
  console: {
    level: (process.env.CONSOLE_LOG_LEVEL || 'info') as
      | 'error'
      | 'warn'
      | 'info'
      | 'http'
      | 'verbose'
      | 'debug'
      | 'silly',
    handleExceptions: true,
    json: false,
    colorize: true
  },
  file: {
    level: 'info',
    handleExceptions: true,
    json: true,
    colorize: false
  }
}
