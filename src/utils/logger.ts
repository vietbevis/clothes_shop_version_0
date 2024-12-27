import 'winston-daily-rotate-file';

import chalk from 'chalk';
import morgan from 'morgan';
import { createLogger, format, type Logger as WinstonLogger, transports } from 'winston';

import { loggerConfig } from '@/config/loggerConfig';

const { combine, timestamp, printf, errors, json } = format;

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

// Color scheme for console output
const colors = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.green.bold,
  http: chalk.magenta.bold,
  verbose: chalk.cyan.bold,
  debug: chalk.blue.bold,
  silly: chalk.gray.bold,
};

// Create formatters
const consoleFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, fileName }) => {
    const color = colors[level as keyof typeof colors] || chalk.white;
    const paddedLevel = `[${level}]`.toUpperCase().padStart(8);
    const fileInfo = fileName ? `[${fileName}]`.toUpperCase().padEnd(30) + ': ' : '';
    return `${timestamp} ${color(paddedLevel)}: ${chalk.gray.bold(fileInfo)}${message}${stack ? `\n${stack}` : ''}`;
  }),
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

// Create transports
const consoleTransport = new transports.Console({
  level: loggerConfig.console.level,
  handleExceptions: loggerConfig.console.handleExceptions,
  format: consoleFormat,
});

const fileTransport = new transports.DailyRotateFile({
  dirname: loggerConfig.logFolder,
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: loggerConfig.maxLogSize,
  maxFiles: loggerConfig.maxFiles,
  level: loggerConfig.file.level,
  format: fileFormat,
});

// Create logger
const logger = createLogger({
  level: loggerConfig.level,
  levels,
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
});

// Define custom logger interface
interface CustomLogger extends WinstonLogger {
  http: WinstonLogger['info'];
}

// Create custom logger object
const Logger: CustomLogger = logger as CustomLogger;

// Add HTTP logging level
Logger.http = Logger.info;

// Create stream for Morgan middleware
const stream = {
  write: (message: string) => {
    Logger.http(message.trim(), { fileName: 'HTTP' });
  },
};

// Create Morgan middleware
export const morganMiddleware = morgan('short', { stream });

export default Logger;
