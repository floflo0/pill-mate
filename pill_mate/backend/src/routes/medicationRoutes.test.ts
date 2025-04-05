import request from 'supertest';

import app from '../app';
import { Medication } from '../models/Medication';
import { User } from '../models/User';
import { UserRole } from '../models/UserRole';
import { MedicationUnit } from '../models/MedicationUnit';

jest.mock('../models/Medication', () => {
    return {
        Medication: {
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

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /medication/', () => {
    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .get('/medication/')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-id.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-id is not a valid user id', async () => {
        const response = await request(app)
            .get('/medication/')
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
            .get('/medication/')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({
            message: 'Missing required header: x-remote-user-name.',
        });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the x-remote-user-display-name header is missing', async () => {
        const response = await request(app)
            .get('/medication/')
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
            .get('/medication/')
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

    it('should return the user medications', async () => {
        const getMedications = jest.fn();
        (getMedications as jest.Mock).mockResolvedValue([
            {
                id: 1,
                name: 'Paracetamol',
                indication: 'The red pills.',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 1,
            },
            {
                id: 1,
                name: 'Syrup',
                quantity: 1,
                unit: MedicationUnit.ML,
                userId: 1,
            },
        ]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            getMedications,
        });

        const response = await request(app)
            .get('/medication/')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual([
            {
                id: 1,
                name: 'Paracetamol',
                indication: 'The red pills.',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 1,
            },
            {
                id: 1,
                name: 'Syrup',
                quantity: 1,
                unit: MedicationUnit.ML,
                userId: 1,
            },
        ]);
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(getMedications).toHaveBeenCalledTimes(1);
        expect(getMedications).toHaveBeenCalledWith();
    });
});

describe('POST /medication/', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).post('/medication/');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .post('/medication/')
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
            .post('/medication/')
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
            .post('/medication/')
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
            .post('/medication/')
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
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unexpectedKey: 0 });
        expect(response.body).toStrictEqual({ message: 'Unexpected key: unexpectedKey' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the name is missing', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({ message: 'name is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the name is invalid', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 0,
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid name.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the indication is invalid', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                indication: 0,
                quantity: 'bad quantity',
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid indication.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the quantity is missing', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({ message: 'quantity is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the quantity is invalid', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 'bad quantity',
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({ message: 'Invalid quantity.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the unit is missing', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
            });
        expect(response.body).toStrictEqual({ message: 'unit is required.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the unit is invalid', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: 'bad unit',
            });
        expect(response.body).toStrictEqual({ message: 'Invalid unit.' });
        expect(response.status).toBe(400);
    });

    it('should return 400 if the userId is invalid', async () => {
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
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
                .post('/medication/')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe')
                .send({
                    name: 'Paracetamol',
                    quantity: 1,
                    unit: MedicationUnit.PILL,
                    userId: 2,
                });
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to add a medication for an other user.',
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
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
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

    it(
        'should create the medication if the user has the role helped and their userId matches ' +
        'their own',
        async () => {
            const createMedication = jest.fn();
            createMedication.mockResolvedValue({
                id: 1,
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 1,
            });
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
                createMedication,
            });
            const response = await request(app)
                .post('/medication/')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe')
                .send({
                    name: 'Paracetamol',
                    quantity: 1,
                    unit: MedicationUnit.PILL,
                    userId: 1,
                });
            expect(response.body).toStrictEqual({
                id: 1,
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 1,
            });
            expect(response.status).toBe(201);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(createMedication).toHaveBeenCalledTimes(1);
            expect(createMedication).toHaveBeenCalledWith({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        },
    );

    it('should create the medication with the userId of the currently logged user', async () => {
        const createMedication = jest.fn();
        createMedication.mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createMedication,
        });
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(createMedication).toHaveBeenCalledTimes(1);
        expect(createMedication).toHaveBeenCalledWith({
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
        });
    });

    it('should create the medication with no indication', async () => {
        const createMedication = jest.fn();
        createMedication.mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createMedication,
        });
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(createMedication).toHaveBeenCalledTimes(1);
        expect(createMedication).toHaveBeenCalledWith({
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
        });
    });

    it('should create the medication with no indication', async () => {
        const createMedication = jest.fn();
        createMedication.mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createMedication,
        });
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                indication: null,
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(createMedication).toHaveBeenCalledTimes(1);
        expect(createMedication).toHaveBeenCalledWith({
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
        });
    });

    it('should create the medication with an indication', async () => {
        const createMedication = jest.fn();
        createMedication.mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            indication: 'An indication.',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
            createMedication,
        });
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                indication: 'An indication.',
                quantity: 1,
                unit: MedicationUnit.PILL,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            indication: 'An indication.',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(201);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(createMedication).toHaveBeenCalledTimes(1);
        expect(createMedication).toHaveBeenCalledWith({
            name: 'Paracetamol',
            indication: 'An indication.',
            quantity: 1,
            unit: MedicationUnit.PILL,
        });
    });

    it('should create the medication for an helped user', async () => {
        const createMedication = jest.fn();
        createMedication.mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 2,
        });
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{
            id: 2,
            homeAssistantUserId: 'ff9e35d488ef5a2125536bcb674fd9fb',
            role: UserRole.HELPED,
            createMedication,
        }]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const response = await request(app)
            .post('/medication/')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 2,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
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
        expect(createMedication).toHaveBeenCalledTimes(1);
        expect(createMedication).toHaveBeenCalledWith({
            name: 'Paracetamol',
            indication: undefined,
            quantity: 1,
            unit: MedicationUnit.PILL,
        });
    });
});

describe('PATCH /medication/:id', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).patch('/medication/1');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .patch('/medication/1')
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
            .patch('/medication/1')
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
            .patch('/medication/1')
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
            .patch('/medication/1')
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
            .patch('/medication/1')
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
            .patch('/medication/invalid_id')
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

    it('should return 404 if the medication is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Medication not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it(
        'should return 403 if the medication belongs to another user and the user role is helped',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            (Medication.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 2,
            });

            const response = await request(app)
                .patch('/medication/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to modify this medication.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Medication.findByPk).toHaveBeenCalledTimes(1);
            expect(Medication.findByPk).toHaveBeenCalledWith(1);
        },
    );

    it(
        'should return 403 if the medication belongs to another user and the user didn\'t help ' +
        'them',
        async () => {
            const getHelpedUsers = jest.fn();
            getHelpedUsers.mockResolvedValue([]);
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPER,
                getHelpedUsers,
            });
            (Medication.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Paracetamol',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 2,
            });
            const response = await request(app)
                .patch('/medication/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to modify this medication.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Medication.findByPk).toHaveBeenCalledTimes(1);
            expect(Medication.findByPk).toHaveBeenCalledWith(1);
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
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        const response = await request(app)
            .patch('/medication/1')
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
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return 400 if the name is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ name: 0 });
        expect(response.body).toStrictEqual({ message: 'Invalid name.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the name', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ name: 'Syrup' });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Syrup',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the indication is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ indication: 0 });
        expect(response.body).toStrictEqual({ message: 'Invalid indication.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the indication', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ indication: 'A new indication.' });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            indication: 'A new indication.',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should remove the indication', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            indication: 'An indication.',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ indication: null });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the quantity is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        const response = await request(app)
            .patch('/medication/1')
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
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the quantity', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ quantity: 2 });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 2,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if the unit is invalid', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unit: 'bad unit' });
        expect(response.body).toStrictEqual({ message: 'Invalid unit.' });
        expect(response.status).toBe(400);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it('should modify the unit', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({ unit: MedicationUnit.TABLET });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.TABLET,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it('should modify all the medication\'s fields', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const save = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            save,
        });
        const response = await request(app)
            .patch('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe')
            .send({
                name: 'Syrup',
                indication: 'A new indication.',
                quantity: 2,
                unit: MedicationUnit.ML,
            });
        expect(response.body).toStrictEqual({
            id: 1,
            name: 'Syrup',
            indication: 'A new indication.',
            quantity: 2,
            unit: MedicationUnit.ML,
            userId: 1,
        });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(save).toHaveBeenCalledTimes(1);
    });
});

describe('DELETE /medication/:id', () => {
    it('should return 415 if the content-type header is not application/json', async () => {
        const response = await request(app).delete('/medication/1');
        expect(response.body).toStrictEqual({
            message: 'Unsupported content type. Only application/json is allowed.',
        });
        expect(response.status).toBe(415);
    });

    it('should return 400 if the x-remote-user-id header is missing', async () => {
        const response = await request(app)
            .delete('/medication/1')
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
            .delete('/medication/1')
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
            .delete('/medication/1')
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
            .delete('/medication/1')
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
            .delete('/medication/1')
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
            .delete('/medication/invalid_id')
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

    it('should return 404 if the medication is not found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        (Medication.findByPk as jest.Mock).mockResolvedValue(null);

        const response = await request(app)
            .delete('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Medication not found.' });
        expect(response.status).toBe(404);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
    });

    it(
        'should return 403 if the medication belongs to another user and the user role is helped',
        async () => {
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPED,
            });
            (Medication.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Paracetamol',
                indication: 'The red pills.',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 2,
            });

            const response = await request(app)
                .delete('/medication/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to delete this medication.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Medication.findByPk).toHaveBeenCalledTimes(1);
            expect(Medication.findByPk).toHaveBeenCalledWith(1);
        },
    );

    it(
        'should return 403 if the medication belongs to another user and the user didn\'t help ' +
        'them',
        async () => {
            const getHelpedUsers = jest.fn();
            getHelpedUsers.mockResolvedValue([]);
            (User.findOne as jest.Mock).mockResolvedValue({
                id: 1,
                homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
                role: UserRole.HELPER,
                getHelpedUsers,
            });
            (Medication.findByPk as jest.Mock).mockResolvedValue({
                id: 1,
                name: 'Paracetamol',
                indication: 'The red pills.',
                quantity: 1,
                unit: MedicationUnit.PILL,
                userId: 2,
            });
            const response = await request(app)
                .delete('/medication/1')
                .set('Content-type', 'application/json')
                .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
                .set('x-remote-user-name', 'johndoe')
                .set('x-remote-user-display-name', 'John Doe');
            expect(response.body).toStrictEqual({
                message: 'You are not allowed to delete this medication.',
            });
            expect(response.status).toBe(403);
            expect(User.findOne).toHaveBeenCalledTimes(1);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
            });
            expect(Medication.findByPk).toHaveBeenCalledTimes(1);
            expect(Medication.findByPk).toHaveBeenCalledWith(1);
            expect(getHelpedUsers).toHaveBeenCalledTimes(1);
            expect(getHelpedUsers).toHaveBeenCalledWith({
                where: { id: 2 },
                attributes: ['id'],
            });
        },
    );

    it('should delete the medication of the other user', async () => {
        const getHelpedUsers = jest.fn();
        getHelpedUsers.mockResolvedValue([{ id: 2 }]);
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPER,
            getHelpedUsers,
        });
        const destroy = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            userId: 2,
            destroy,
        });

        const response = await request(app)
            .delete('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Medication removed successfully.' });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(getHelpedUsers).toHaveBeenCalledTimes(1);
        expect(getHelpedUsers).toHaveBeenCalledWith({
            where: { id: 2 },
            attributes: ['id'],
        });
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it('should delete the medication of the other user', async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            id: 1,
            homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9',
            role: UserRole.HELPED,
        });
        const destroy = jest.fn();
        (Medication.findByPk as jest.Mock).mockResolvedValue({
            id: 1,
            name: 'Paracetamol',
            quantity: 1,
            unit: MedicationUnit.PILL,
            userId: 1,
            destroy,
        });

        const response = await request(app)
            .delete('/medication/1')
            .set('Content-type', 'application/json')
            .set('x-remote-user-id', 'c355d2aaeee44e4e84ff8394fa4794a9')
            .set('x-remote-user-name', 'johndoe')
            .set('x-remote-user-display-name', 'John Doe');
        expect(response.body).toStrictEqual({ message: 'Medication removed successfully.' });
        expect(response.status).toBe(200);
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(User.findOne).toHaveBeenCalledWith({
            where: { homeAssistantUserId: 'c355d2aaeee44e4e84ff8394fa4794a9' },
        });
        expect(Medication.findByPk).toHaveBeenCalledTimes(1);
        expect(Medication.findByPk).toHaveBeenCalledWith(1);
        expect(destroy).toHaveBeenCalledTimes(1);
    });
});
