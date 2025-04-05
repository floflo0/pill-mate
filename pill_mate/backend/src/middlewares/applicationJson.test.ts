import { Request, Response } from 'express';

import { applicationJson } from './applicationJson';

describe('applicationJson middleware', () => {
    it(
        'should return 415 if the content-type header is not application/json for a POST request',
        () => {
            const request = {
                get: jest.fn(),
                method: 'POST',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should return 415 if the content-type header is not application/json for a PUT request',
        () => {
            const request = {
                get: jest.fn(),
                method: 'PUT',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should return 415 if the content-type header is not application/json for a PATCH request',
        () => {
            const request = {
                get: jest.fn(),
                method: 'PATCH',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should return 415 if the content-type header is not application/json for a DELETE request',
        () => {
            const request = {
                get: jest.fn(),
                method: 'DELETE',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should call the next function for a GET request',
        () => {
            const request = {
                get: jest.fn(),
                method: 'GET',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(0);
            expect(response.json).toHaveBeenCalledTimes(0);
            expect(next).toHaveBeenCalledTimes(1);
        },
    );

    it(
        'should call the next function if a POST request has a content-type of application/json',
        () => {
            const request = {
                get: jest.fn(),
                method: 'POST',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should call the next function if a PUT request has a content-type of application/json',
        () => {
            const request = {
                get: jest.fn(),
                method: 'PUT',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should call the next function if a PATCH request has a content-type of application/json',
        () => {
            const request = {
                get: jest.fn(),
                method: 'PATCH',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );

    it(
        'should call the next function if a DELETE request has a content-type of application/json',
        () => {
            const request = {
                get: jest.fn(),
                method: 'DELETE',
            };
            request.get.mockReturnValue('bad content type');
            const response = {
                status: jest.fn(),
                json: jest.fn(),
            };
            response.status.mockReturnValue(response);
            const next = jest.fn();
            applicationJson(request as unknown as Request, response as unknown as Response,  next);
            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(415);
            expect(response.json).toHaveBeenCalledTimes(1);
            expect(response.json).toHaveBeenCalledWith({
                message: 'Unsupported content type. Only application/json is allowed.',
            });
            expect(next).toHaveBeenCalledTimes(0);
        },
    );
});
