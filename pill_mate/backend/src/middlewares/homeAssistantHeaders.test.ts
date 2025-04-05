import { Request, Response } from 'express';

import { homeAssistantHeaders } from './homeAssistantHeaders';

describe('homeAssistantHeaders middleware', () => {
    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const request = {
            get: jest.fn(),
        };
        request.get.mockReturnValue(undefined);
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        homeAssistantHeaders(request as unknown as Request, response as unknown as Response, next);
        expect(request.get).toHaveBeenCalledTimes(1);
        expect(request.get).toHaveBeenCalledWith('x-remote-user-id');
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const request = {
            get: jest.fn(),
        };
        request.get.mockReturnValue('bad home assistant id');
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        homeAssistantHeaders(request as unknown as Request, response as unknown as Response, next);
        expect(request.get).toHaveBeenCalledTimes(1);
        expect(request.get).toHaveBeenCalledWith('x-remote-user-id');
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Invalid home assistant user id in x-remote-user-id.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 if the x-remote-user-name header is missing', async () => {
        const request = {
            get: jest.fn(),
        };
        request.get.mockImplementation((header) => {
            if (header === 'x-remote-user-id') return 'c355d2aaeee44e4e84ff8394fa4794a9';
            if (header === 'x-remote-user-name') return undefined;
            fail(`unknown header: ${header}`);
        });
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        homeAssistantHeaders(request as unknown as Request, response as unknown as Response, next);
        expect(request.get).toHaveBeenCalledTimes(2);
        expect(request.get).toHaveBeenCalledWith('x-remote-user-name');
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const request = {
            get: jest.fn(),
        };
        request.get.mockImplementation((header) => {
            if (header === 'x-remote-user-id') return 'c355d2aaeee44e4e84ff8394fa4794a9';
            if (header === 'x-remote-user-name') return 'johndoe';
            if (header === 'x-remote-user-display-name') return undefined;
            fail(`unknown header: ${header}`);
        });
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        homeAssistantHeaders(request as unknown as Request, response as unknown as Response, next);
        expect(request.get).toHaveBeenCalledTimes(3);
        expect(request.get).toHaveBeenCalledWith('x-remote-user-display-name');
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Missing required header: x-remote-user-display-name.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });
});
