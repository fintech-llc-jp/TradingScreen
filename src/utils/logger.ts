type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const logLevels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLogLevel: LogLevel = (import.meta.env.LOG_LEVEL as LogLevel) || 'info';
const currentLevelNumber = logLevels[currentLogLevel];

const shouldLog = (level: LogLevel): boolean => {
  return logLevels[level] <= currentLevelNumber;
};

export const logger = {
  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.log(...args);
    }
  },
  debug: (...args: any[]) => {
    if (shouldLog('debug')) {
      console.log(...args);
    }
  }
};