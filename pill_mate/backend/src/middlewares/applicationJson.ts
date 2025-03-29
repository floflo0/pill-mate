import { NextFunction, Request, Response } from 'express';
import { HTTP_415_UNSUPPORTED_MEDIA_TYPE } from '../status';

export const applicationJson = (request: Request, response: Response, next: NextFunction) => {
    if (request.method !== 'GET' && request.get('content-type') !== 'application/json') {
        response
            .status(HTTP_415_UNSUPPORTED_MEDIA_TYPE)
            .json({ message: 'Unsupported content type. Only application/json is allowed.' });
        return;
    }

    next();
};
