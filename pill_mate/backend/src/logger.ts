import winston from 'winston';

const NODE_ENV = process.env.NODE_ENV || 'production';

const log_levels: { [key: string]: string } = {
    production: 'info',
    developement: 'debug',
    test: 'off',
};

export const createLogger = (label: string) => winston.createLogger({
    level: log_levels[NODE_ENV],
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.label({ label, message: true }),
        winston.format.padLevels(),
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        }),
    ),
    transports: [new winston.transports.Console()],
});
