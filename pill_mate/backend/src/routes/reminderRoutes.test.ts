import request from 'supertest';

import app from '../app';
import { Medication } from '../models/Medication';
import { Reminder } from '../models/Reminder';
import { User } from '../models/User';
import { UserRole } from '../models/UserRole';

jest.mock('../models/Medication', () => {
    return {
        Medication: {
            findByPk: jest.fn(),
        },
    };
});

jest.mock('../models/Reminder', () => {
    return {
        Reminder: {
            findByPk: jest.fn(),
        },
    };
});

jest.mock('../models/User', () => {
    return {
        User: {
            findOne: jest.fn(),
        },
    };
});

jest.useFakeTimers();

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /reminder/', () => {
    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .get('/reminder/')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const response = await request(app)
            .get('/reminder/')
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
            .get('/reminder/')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const response = await request(app)
            .get('/reminder/')
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
            .get('/reminder/')
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

    it('should return the user reminders', async () => {
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
            .get('/reminder/')
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
});

describe('POST /reminder/', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).post('/reminder/');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .post('/reminder/')
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
            .post('/reminder/')
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
            .post('/reminder/')
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
            .post('/reminder/')
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
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unexpectedKey: 0 });
        expect(response.body).toStrictEqual({ message: 'Unexpected key: unexpectedKey' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the time is missing', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                frequency: 1,
                quantity: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'time is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the time is invalid', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: 'bad time',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid time.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the frequency is missing', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                quantity: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'frequency is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the frequency is invalid', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 'bad frequency',
                quantity: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid frequency.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the quantity is missing', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'quantity is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the quantity is invalid', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 'bad quantity',
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid quantity.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the medicationId is missing', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
            });
        expect(response.body).toStrictEqual({ message: 'medicationId is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the medicationId is invalid', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 'bad medicationId',
            });
        expect(response.body).toStrictEqual({ message: 'Invalid medicationId.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the userId is invalid', async () => {
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 'bad userId',
            });
        expect(response.body).toStrictEqual({ message: 'Invalid userId.' });
        expect(response.status).toBe(400);
    });

    it(
        'should return 403 if the user has the role helped and the medication not in the database',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            const response = await request(app)
                .post('/reminder/')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe')
                .send({
                    time: '12:00',
                    frequency: 1,
                    quantity: 1,
                    medicationId: 1,
                    userId: 2,
                });
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to add a reminder for an other user.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
        },
    );

    it('should return 404 if the helped user is not in the database', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 2,
            });
        expect(response.body).toStrictEqual({ message: 'Helped user not found.' });
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

    it('should return 404 if the medication is not in the database', async () => {
        const getMedications = jest.fn();
        getMedications.mockResolvedValue([]);
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{
            id: 2,
            homeAssistantUserId: 'ff9e35d488ef5a2125536bcb674fd9fb',
            role: UserRole.HELPED,
            getMedications,
        }]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 2,
            });
        expect(response.body).toStrictEqual({ message: 'Medication not found.' });
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
        expect(getMedications).toHaveBeenCalledTimes(1);
        expect(getMedications).toHaveBeenCalledWith({
            where: { id: 1 },
            attributes: ['id'],
        });
    });

    it(
        'should create the reminder if the user has the role helped and their userId matches ' +
        'their own',
        async () => {
            const getMedications = jest.fn();
            getMedications.mockResolvedValue([{ id: 1 }]);
            const createReminder = jest.fn();
            createReminder.mockResolvedValue({
                id: 1,
                time: '12:00',
                nextDate: '2025-03-13',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 1,
            });
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
                createReminder,
                getMedications,
            });
            jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
            const response = await request(app)
                .post('/reminder/')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe')
                .send({
                    time: '12:00',
                    frequency: 1,
                    quantity: 1,
                    medicationId: 1,
                    userId: 1,
                });
            expect(response.body).toStrictEqual({
                id: 1,
                time: '12:00',
                nextDate: '2025-03-13',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 1,
            });
            expect(response.status).toBe(201);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(getMedications).toHaveBeenCalledTimes(1);
            expect(getMedications).toHaveBeenCalledWith({
                where: { id: 1 },
                attributes: ['id'],
            });
            expect(createReminder).toHaveBeenCalledTimes(1);
            expect(createReminder).toHaveBeenCalledWith({
                time: '12:00',
                nextDate: expect.any(Date),
                frequency: 1,
                quantity: 1,
                medicationId: 1,
            });
            expect(createReminder.mock.calls[0][0].nextDate.getTime())
                .toBe(new Date('2025-03-13T10:00:00Z').getTime());
        },
    );

    it('should create the reminder with the nextDate set to tomorrow', async () => {
        const getMedications = jest.fn();
        getMedications.mockResolvedValue([{ id: 1 }]);
        const createReminder = jest.fn();
        createReminder.mockResolvedValue({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-14',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createReminder,
            getMedications,
        });
        jest.setSystemTime(new Date('2025-03-13T14:00:00Z'));
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 1,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-14',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getMedications).toHaveBeenCalledTimes(1);
        expect(getMedications).toHaveBeenCalledWith({
            where: { id: 1 },
            attributes: ['id'],
        });
        expect(createReminder).toHaveBeenCalledTimes(1);
        expect(createReminder).toHaveBeenCalledWith({
            time: '12:00',
            nextDate: expect.any(Date),
            frequency: 1,
            quantity: 1,
            medicationId: 1,
        });
        expect(createReminder.mock.calls[0][0].nextDate.getTime())
            .toBe(new Date('2025-03-14T14:00:00Z').getTime());

    });

    it('should create the reminder with the userId of the currently logged user', async () => {
        const getMedications = jest.fn();
        getMedications.mockResolvedValue([{ id: 1 }]);
        const createReminder = jest.fn();
        createReminder.mockResolvedValue({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-13',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createReminder,
            getMedications,
        });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-13',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getMedications).toHaveBeenCalledTimes(1);
        expect(getMedications).toHaveBeenCalledWith({
            where: { id: 1 },
            attributes: ['id'],
        });
        expect(createReminder).toHaveBeenCalledTimes(1);
        expect(createReminder).toHaveBeenCalledWith({
            time: '12:00',
            nextDate: expect.any(Date),
            frequency: 1,
            quantity: 1,
            medicationId: 1,
        });
        expect(createReminder.mock.calls[0][0].nextDate.getTime())
            .toBe(new Date('2025-03-13T10:00:00Z').getTime());
    });

    it('should create the reminder for an helped user', async () => {
        const getMedications = jest.fn();
        getMedications.mockResolvedValue([{ id: 1 }]);
        const createReminder = jest.fn();
        createReminder.mockResolvedValue({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-13',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 2,
        });
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{
            id: 2,
            homeAssistantUserId: 'ff9e35d488ef5a2125536bcb674fd9fb',
            role: UserRole.HELPED,
            getMedications,
            createReminder,
        }]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .post('/reminder/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '12:00',
                frequency: 1,
                quantity: 1,
                medicationId: 1,
                userId: 2,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            nextDate: '2025-03-13',
            frequency: 1,
            quantity: 1,
            medicationId: 1,
            userId: 2,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getHelpedUsers).toHaveBeenCalledTimes(1);
        expect(getHelpedUsers).toHaveBeenCalledWith({
            where: { id: 2 },
            attributes: ['id'],
        });
        expect(getMedications).toHaveBeenCalledTimes(1);
        expect(getMedications).toHaveBeenCalledWith({
            where: { id: 1 },
            attributes: ['id'],
        });
        expect(createReminder).toHaveBeenCalledTimes(1);
        expect(createReminder).toHaveBeenCalledWith({
            time: '12:00',
            nextDate: expect.any(Date),
            frequency: 1,
            quantity: 1,
            medicationId: 1,
        });
        expect(createReminder.mock.calls[0][0].nextDate.getTime())
            .toBe(new Date('2025-03-13T10:00:00Z').getTime());
    });
});

describe('PATCH /reminder/:id', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).patch('/reminder/1');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .patch('/reminder/1')
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
            .patch('/reminder/1')
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
            .patch('/reminder/1')
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
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
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
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
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
            .patch('/reminder/invalid_id')
            .set('Content-type', 'application/json')
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

    it('should return 404 if the reminder is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Reminder not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it(
        'should return 403 if the reminder belongs to another user and the user role is helped',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            (Reminder.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            });

            const response = await request(app)
                .patch('/reminder/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to modify this reminder.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
            expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        },
    );

    it(
        'should return 403 if the reminder belongs to another user and the user didn\'t help them',
        async () => {
            const getHelpedUsers = jest.fn();
            getHelpedUsers.mockResolvedValue([]);
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPER,
                getHelpedUsers,
            });
            (Reminder.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            });

            const response = await request(app)
                .patch('/reminder/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to modify this reminder.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
            expect(Reminder.findByPk).toHaveBeenCalledWith(1);
            expect(getHelpedUsers).toHaveBeenCalledTimes(1);
            expect(getHelpedUsers).toHaveBeenCalledWith({
                where: { id: 2 },
                attributes: ['id'],
            });
        },
    );

    it('should return 400 if there is an unexpected key in the request body', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unexpectedKey: 0 });
        expect(response.body).toStrictEqual({ message: 'Unexpected key: unexpectedKey' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 400 if the time is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ time: 'bad time' });
        expect(response.body).toStrictEqual({ message: 'Invalid time.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the time', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ time: '14:00' });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        expect(response.body).toStrictEqual({
            id: 1,
            time: '14:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should modify the time and update the nextDate', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ time: '08:00' });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '08:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-14',
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the frequency is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ frequency: 'bad frequency' });
        expect(response.body).toStrictEqual({ message: 'Invalid frequency.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the frequency', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ frequency: 2 });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            frequency: 2,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the quantity is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ quantity: 'bad quantity' });
        expect(response.body).toStrictEqual({ message: 'Invalid quantity.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the quantity', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ quantity: 2 });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 2,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the nextDate is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ nextDate: 'bad nextDate' });
        expect(response.body).toStrictEqual({ message: 'Invalid nextDate.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 400 if the nextDate is in the past', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '08:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-14',
            medicationId: 1,
            userId: 1,
        });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ nextDate: '2025-03-13' });

        expect(response.body).toStrictEqual({ message: 'nextDate must be in the future.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the nextDate', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-14',
            medicationId: 1,
            userId: 1,
            save,
        });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ nextDate: '2025-03-13' });

        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the medicationId is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ medicationId: 'bad medicationId' });
        expect(response.body).toStrictEqual({ message: 'Invalid medicationId.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 404 if the medicationId is not in the database', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue(null);
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ medicationId: 2 });
        expect(response.body).toStrictEqual({ message: 'Medication not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(
            2,
            { attributes: ['userId'] },
        );
    });

    it(
        'should return 400 if the medication belongs to another user than the reminder',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            (Reminder.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 1,
            });
            (Medication.findByPk as jest.Mock).mockResolvedValue({ userId: 2 });
            const response = await request(app)
                .patch('/reminder/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe')
                .send({ medicationId: 2 });
            expect(response.body).toStrictEqual({
                message: 'This medication doesn\'t belong to the same user as the reminder.',
            });
            expect(response.status).toBe(400);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
            expect(Reminder.findByPk).toHaveBeenCalledWith(1);
            expect(Medication.findByPk).toHaveBeenCalledTimes(1);
            expect(Medication.findByPk).toHaveBeenCalledWith(
                2,
                { attributes: ['userId'] },
            );
        },
    );

    it('should modify the medicationId', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({ userId: 1 });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ medicationId: 2 });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 2,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(
            2,
            { attributes: ['userId'] },
        );
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should modify the medicationId for the reminder of an helped user', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{ id: 2}]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 2,
            save,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({ userId: 2 });
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ medicationId: 2 });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 2,
            userId: 2,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(
            2,
            { attributes: ['userId'] },
        );
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should modify all the reminder\'s fields', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            save,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({ userId: 1 });
        jest.setSystemTime(new Date('2025-03-13T10:00:00Z'));
        const response = await request(app)
            .patch('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                time: '08:00',
                frequency: 2,
                quantity: 2,
                nextDate: '2025-03-14',
                medicationId: 2,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            time: '08:00',
            frequency: 2,
            quantity: 2,
            nextDate: '2025-03-14',
            medicationId: 2,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(
            2,
            { attributes: ['userId'] },
        );
        expect(save).toHaveBeenCalledTimes(1);
    });
});

describe('DELETE /reminder/:id', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).delete('/reminder/1');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .delete('/reminder/1')
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
            .delete('/reminder/1')
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
            .delete('/reminder/1')
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
            .delete('/reminder/1')
            .set('Content-type', 'application/json')
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
            .delete('/reminder/1')
            .set('Content-type', 'application/json')
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
            .delete('/reminder/invalid_id')
            .set('Content-type', 'application/json')
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

    it('should return 404 if the reminder is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Reminder.findByPk as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .delete('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Reminder not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
    });

    it(
        'should return 403 if the reminder belongs to another user and the user role is helped',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            (Reminder.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            });

            const response = await request(app)
                .delete('/reminder/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to delete this reminder.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
            expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        },
    );

    it(
        'should return 403 if the reminder belongs to another user and the user didn\'t help them',
        async () => {
            const getHelpedUsers = jest.fn();
            getHelpedUsers.mockResolvedValue([]);
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPER,
                getHelpedUsers,
            });
            (Reminder.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                time: '12:00',
                frequency: 1,
                quantity: 1,
                nextDate: '2025-03-13',
                medicationId: 1,
                userId: 2,
            });

            const response = await request(app)
                .delete('/reminder/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to delete this reminder.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
            expect(Reminder.findByPk).toHaveBeenCalledWith(1);
            expect(getHelpedUsers).toHaveBeenCalledTimes(1);
            expect(getHelpedUsers).toHaveBeenCalledWith({
                where: { id: 2 },
                attributes: ['id'],
            });
        },
    );

    it('should delete the reminder of the other user', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{ id: 2 }]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const destroy = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 2,
            destroy,
        });

        const response = await request(app)
            .delete('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Reminder removed successfully.' });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(getHelpedUsers).toHaveBeenCalledTimes(1);
        expect(getHelpedUsers).toHaveBeenCalledWith({
            where: { id: 2 },
            attributes: ['id'],
        });
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('should delete the reminder of the other user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const destroy = jest.fn();
        (Reminder.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            time: '12:00',
            frequency: 1,
            quantity: 1,
            nextDate: '2025-03-13',
            medicationId: 1,
            userId: 1,
            destroy,
        });

        const response = await request(app)
            .delete('/reminder/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Reminder removed successfully.' });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Reminder.findByPk).toHaveBeenCalledTimes(1);
        expect(Reminder.findByPk).toHaveBeenCalledWith(1);
        expect(destroy).toHaveBeenCalledTimes(1);
    });
});
