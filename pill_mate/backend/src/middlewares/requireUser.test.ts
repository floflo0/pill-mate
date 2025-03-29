import { Request, Response } from 'express';

import { User } from '../models/User';
import { UserRole } from '../models/UserRole';
import { requireUser } from './requireUser';

jest.mock('../models/User', () => {
    return {
        User: {
            findOne: jest.fn(),
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('requireUser middleware', () => {
    it('should return 401 if the user is not in the database', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        const request = { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' };
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        await requireUser(request as unknown as Request, response as unknown as Response, next);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(401);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'User not registered.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });

    it('should call the next function', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const request = {
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            user: undefined,
        };
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        await requireUser(request as unknown as Request, response as unknown as Response, next);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(response.status).toHaveBeenCalledTimes(0);
        expect(response.json).toHaveBeenCalledTimes(0);
        expect(request.user).toStrictEqual({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        expect(next).toHaveBeenCalledTimes(1);
    });
});
