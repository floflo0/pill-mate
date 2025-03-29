import { Request, Response, NextFunction } from 'express';
import { HTTP_400_BAD_REQUEST } from '../status';
import { isHomeAssistantUserIdValid } from '../utils';

export const homeAssistantHeaders = (request: Request, response: Response, next: NextFunction) => {
    const homeAssistantUserId = request.get('x-remote-user-id');
    if (homeAssistantUserId === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Missing required header: x-remote-user-id.' });
        return;
    }
    if (!isHomeAssistantUserIdValid(homeAssistantUserId)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid home assistant user id in x-remote-user-id.' });
        return;
    }
    request.homeAssistantUserId = homeAssistantUserId;

    const homeAssistantUserName = request.get('x-remote-user-name');
    if (homeAssistantUserName === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Missing required header: x-remote-user-name.' });
        return;
    }
    request.homeAssistantUserName = homeAssistantUserName;

    const homeAssistantUserDisplayName = request.get('x-remote-user-display-name');
    if (homeAssistantUserDisplayName === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Missing required header: x-remote-user-display-name.' });
        return;
    }
    request.homeAssistantUserDisplayName = homeAssistantUserDisplayName;

    next();
};
