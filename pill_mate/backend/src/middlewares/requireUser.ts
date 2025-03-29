import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User';
import { HTTP_401_UNAUTHORIZED } from '../status';

export const requireUser = async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.findOne({
        where: { homeAssistantUserId: request.homeAssistantUserId },
    });

    if (user === null) {
        response
            .status(HTTP_401_UNAUTHORIZED)
            .json({ message: 'User not registered.' });
        return;
    }

    request.user = user;

    next();
};
