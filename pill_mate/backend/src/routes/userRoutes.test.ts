import request from 'supertest';

import app from '../app';
import { Reminder } from '../models/Reminder';
import { User } from '../models/User';
import { UserRole } from '../models/UserRole';

jest.mock('../models/Reminder', () => {
    return {
        Reminder: {
            findAll: jest.fn(),
        },
    };
});

jest.mock('../models/User', () => {
    return {
        User: {
            create: jest.fn(),
            findOne: jest.fn(),
        },
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /user/me', () => {
    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-id', 'bad home assistant id')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Invalid home assistant user id in x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-name header is missing', async () => {
        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-display-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 401 if user is not in the database', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'User not registered.' });
        expect(response.status).toBe(401);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
    });

    it('should return user details if the user exists in the database', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });

        const response = await request(app)
            .get('/user/me')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            userName: 'johndoe',
            userDisplayName: 'John Doe',
            role: UserRole.HELPED,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
    });
});

describe('POST /user/', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).post('/user/');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'bad home assistant id')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Invalid home assistant user id in x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-name header is missing', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-display-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if there is an unexpected key in the request body', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unexpectedKey: 0 });
        expect(response.body).toStrictEqual({ message: 'Unexpected key: unexpectedKey' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the role is missing', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({});
        expect(response.body).toStrictEqual({ message: 'role is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the role is invalid', async () => {
        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ role: 'bad role' });
        expect(response.body).toStrictEqual({ message: 'Invalid role.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the user is already registered', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });

        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ role: UserRole.HELPED });
        expect(response.body).toStrictEqual({ message: 'The user already exists.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            attributes: ['id'],
        });
    });

    it('should create the user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (User.create as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });

        const response = await request(app)
            .post('/user/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ role: UserRole.HELPED });
        expect(response.body).toStrictEqual({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            userName: 'johndoe',
            userDisplayName: 'John Doe',
            role: UserRole.HELPED,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            attributes: ['id'],
        });
        expect(User.create).toHaveBeenCalledTimes(1);
        expect(User.create).toHaveBeenCalledWith({
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
    });
});

describe('GET /user/:id/reminders', () => {
    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'bad home assistant id')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Invalid home assistant user id in x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-name header is missing', async () => {
        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-display-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 401 if user is not in the database', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'User not registered.' });
        expect(response.status).toBe(401);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
    });

    it('should return 400 if the id parameter is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });

        const response = await request(app)
            .get('/user/invalid_id/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Invalid parameter: id.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
    });

    it('should return 403 if the is as the role helped', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });

        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'You do not have permission to access this resource.',
        });
        expect(response.status).toBe(403);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
    });

    it('should return 404 if the user as no helped users', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });

        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'User not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getHelpedUsers).toHaveBeenCalledTimes(1);
        expect(getHelpedUsers).toHaveBeenCalledWith({
            where: { id: 2 },
            attributes: ['id'],
        });
    });

    it('should return the reminders of an helped user', async () => {
        const getReminders = jest.fn();
        (getReminders as jest.Mock).mockResolvedValue([
            {
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 1,
            },
            {
                id: 2,
                time: '19:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 1,
            },
        ]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            getReminders,
        });

        const response = await request(app)
            .get('/user/1/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual([
            {
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 1,
            },
            {
                id: 2,
                time: '19:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 1,
            },
        ]);
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getReminders).toHaveBeenCalledTimes(1);
        expect(getReminders).toHaveBeenCalledWith();
    });

    it('should return the requested user reminders', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{ id: 2 }]);
        (Reminder.findAll as jest.Mock).mockResolvedValue([
            {
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            },
            {
                id: 2,
                time: '19:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            },
        ]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });

        const response = await request(app)
            .get('/user/2/reminders')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual([
            {
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            },
            {
                id: 2,
                time: '19:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            },
        ]);
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getHelpedUsers).toHaveBeenCalledTimes(1);
        expect(getHelpedUsers).toHaveBeenCalledWith({
            where: { id: 2 },
            attributes: ['id'],
        });
        expect(Reminder.findAll).toHaveBeenCalledTimes(1);
        expect(Reminder.findAll).toHaveBeenCalledWith({ where: { userId: 2 } });
    });
});
