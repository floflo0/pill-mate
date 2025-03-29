import assert from 'assert';

import { Request, Response } from 'express';

import { asyncErrorHandler, checkUnexpectedKeys } from '../utils';
import {
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../status';

import { Medication  } from '../models/Medication';
import { isMedicationUnit  } from '../models/MedicationUnit';
import { User } from '../models/User';
import { UserRole } from '../models/UserRole';

export const getMedications = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);

    const medications = await request.user.getMedications();

    response
        .status(HTTP_200_OK)
        .json(medications);
});

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateMedication:
 *       type: object
 *       required:
 *         - name
 *         - quantity
 *         - unit
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the medication.
 *           example: Paracetamol
 *         indication:
 *           type: string
 *           description: An indication that help identify the medication.
 *           example: The red pills.
 *         quantity:
 *           type: number
 *           description: The quantity of medication remaining.
 *           example: 10
 *         unit:
 *           $ref: '#/components/schemas/MedicationUnit'
 *         userId:
 *           type: integer
 *           description: The id of the user to whom the medication belongs.
 *           example: 1
 */
interface CreateMedicationBody {
    name: unknown,
    indication: unknown,
    quantity: unknown,
    unit: unknown,
    userId: unknown,
}

export const createMedication = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);

    if (!checkUnexpectedKeys<CreateMedicationBody>(
        request.body,
        ['name', 'indication', 'quantity', 'unit', 'userId'],
        response,
    )) return;

    const { name, indication, quantity, unit, userId } = request.body as CreateMedicationBody;

    if (name === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'name is required.' });
        return;
    }

    if (typeof name !== 'string') {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid name.' });
        return;
    }

    if (indication !== undefined && indication !== null && typeof indication !== 'string') {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid name.' });
        return;
    }

    if (quantity === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'quantity is required.' });
        return;
    }

    if (typeof quantity !== 'number' || quantity <= 0.0) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid quantity.' });
        return;
    }

    if (unit === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'unit is required.' });
        return;
    }

    if (!isMedicationUnit(unit)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid unit.' });
        return;
    }

    let user: User;
    if (userId === undefined || userId === request.user.id) {
        user = request.user;
    } else {
        if (typeof userId !== 'number') {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid userId.' });
            return;
        }

        if (request.user.role === UserRole.HELPED) {
            response
                .status(HTTP_403_FORBIDDEN)
                .json({ message: 'Your not allowed to add a reminder for an other user.' });
            return;
        }

        if (request.user.role === UserRole.HELPER) {
            const helpedUsers = await request.user.getHelpedUsers({
                where: {
                    id: userId,
                },
            });
            assert(helpedUsers.length <= 1);
            if (helpedUsers.length === 0) {
                response
                    .status(HTTP_404_NOT_FOUND)
                    .json({ message: 'Helped user not found.' });
                return;
            }

            user = helpedUsers[0];
        }

        assert(false, 'unreachable');
    }

    const medication = await user.createMedication({
        name,
        indication,
        quantity,
        unit,
    });

    response
        .status(HTTP_201_CREATED)
        .json({
            name: medication.name,
            indication: medication.indication,
            quantity: medication.quantity,
            unit: medication.unit,
            userId: medication.userId,
        });
});

/**
 * @openapi
 * components:
 *   schemas:
 *     PatchMedication:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The new name of the medication.
 *           example: Paracetamol
 *         indication:
 *           type: string
 *           description: The new indication that help identify the medication.
 *           example: The red pills.
 *         quantity:
 *           type: number
 *           description: The new quantity of medication remaining.
 *           example: 10
 *         unit:
 *           $ref: '#/components/schemas/MedicationUnit'
 */
interface PatchMedicationBody {
    name: unknown,
    indication: unknown,
    quantity: unknown,
    unit: unknown,
}

export const patchMedication = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);
    assert(request.params.id !== undefined);

    if (!/^\d+$/.test(request.params.id)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid parameter: id.' });
        return;
    }

    const id = parseInt(request.params.id, 10);

    const medication = await Medication.findByPk(id);

    if (medication === null) {
        response
            .status(HTTP_404_NOT_FOUND)
            .json({ message: 'Medication not found.' });
        return;
    }

    if (!checkUnexpectedKeys<PatchMedicationBody>(
        request.body,
        ['name', 'indication', 'quantity', 'unit'],
        response,
    )) return;

    const { name, indication, quantity, unit } = request.body as PatchMedicationBody;

    if (name !== undefined) {
        if (typeof name !== 'string') {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid name.' });
            return;
        }

        medication.name = name;
    }

    if (indication !== undefined) {
        if (indication !== null && typeof indication !== 'string') {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid indication.' });
            return;
        }

        medication.indication = indication;
    }

    if (quantity !== undefined)  {
        if (typeof quantity !== 'number' || quantity <= 0.0) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid quantity.' });
            return;
        }

        medication.quantity = quantity;
    }

    if (unit !== undefined) {
        if (!isMedicationUnit(unit)) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid unit.' });
            return;
        }

        medication.unit = unit;
    }

    medication.save();

    response
        .status(HTTP_200_OK)
        .json({
            name: medication.name,
            indication: medication.indication,
            quantity: medication.quantity,
            unit: medication.unit,
            userId: medication.userId,
        });
});

export const deleteMedication = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);
    assert(request.params.id !== undefined);

    if (!/^\d+$/.test(request.params.id)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid parameter: id.' });
        return;
    }

    const id = parseInt(request.params.id, 10);

    const nbrOfDeletions = await Medication.destroy({ where: { id } });
    assert(nbrOfDeletions <= 1);

    if (nbrOfDeletions === 0) {
        response
            .status(HTTP_404_NOT_FOUND)
            .json({ message: 'Medication not found.' });
        return;
    }

    response
        .status(HTTP_200_OK)
        .json({ message: 'Medication removed successfully.' });
});
