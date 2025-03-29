import { Request, Response } from 'express';

import { errorHandling } from './errorHandling';

describe('errorHandling middleware', () => {
    it('should return 500', () => {
        const response = {
            status: jest.fn(),
            json: jest.fn(),
        };
        response.status.mockReturnValue(response);
        const next = jest.fn();
        errorHandling(new Error(), {} as Request, response as unknown as Response, next);
        expect(response.status).toHaveBeenCalledTimes(1);
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledTimes(1);
        expect(response.json).toHaveBeenCalledWith({
            message: 'Internal Server Error.',
        });
        expect(next).toHaveBeenCalledTimes(0);
    });
});
