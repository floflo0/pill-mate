import { NextFunction, Request, Response } from 'express';
import { HTTP_400_BAD_REQUEST } from './status';

export const asyncErrorHandler = (
    func: (request: Request, response: Response) => Promise<void>,
) => {
    return async (request: Request, response: Response, next: NextFunction) => {
        await Promise.resolve(func(request, response)).catch(next);
    };
};

export const checkUnexpectedKeys = <T extends object>(
    body: object,
    allowedKeys: Array<keyof T>,
    response: Response,
): boolean => {
    const unexpectedKeys = Object.keys(body).filter(
        key => !allowedKeys.includes(key as keyof T),
    );

    if (unexpectedKeys.length > 0) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({
                message: `Unexpected key${unexpectedKeys.length > 1 ? 's' : ''}: ` +
                    unexpectedKeys.join(', '),
            });
        return false;
    }

    return true;
};

export const isTimeValid = (time: unknown): time is string => {
    return typeof time === 'string' && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export const isDateValid = (dateStr: unknown): dateStr is string => {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const date = new Date(dateStr);
    const [year, month, day] = dateStr.split('-').map(x => parseInt(x, 10));

    return date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day;
};

export const isHomeAssistantUserIdValid = (id: unknown): id is string  => {
    return typeof id === 'string' && /^[0-9a-f]{32}$/.test(id);
};
