import assert from 'assert';

import { Request, Response } from 'express';

import { Medication } from '../models/Medication';
import { Reminder } from '../models/Reminder';
import { User } from '../models/User';
import { UserRole } from '../models/UserRole';
import {
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../status';
import { asyncErrorHandler, checkUnexpectedKeys, isDateValid, isTimeValid } from '../utils';

export const getReminders = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);

    const reminders = await request.user.getReminders();

    response
        .status(HTTP_200_OK)
        .json(reminders);
});

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateReminder:
 *       type: object
 *       required:
 *         - time
 *         - frequency
 *         - quantity
 *         - medicationId
 *       properties:
 *         time:
 *           type: string
 *           description: Reminder time.
 *           example: 12:00
 *         frequency:
 *           type: integer
 *           description: The number of days between each reminder.
 *           example: 1
 *         quantity:
 *           type: number
 *           description: The quantity of medication the user must take.
 *           example: 1
 *         medicationId:
 *           type: integer
 *           description: The id of the medication to take.
 *           example: 1
 *         userId:
 *           type: integer
 *           description: The id of the user to link the reminder.
 *           example: 1
 */
type CreateReminderBody = {
    time: unknown,
    frequency: unknown,
    quantity: unknown,
    medicationId: unknown,
    userId: unknown,
};

export const createReminder = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);

    if (!checkUnexpectedKeys<CreateReminderBody>(
        request.body,
        ['time', 'frequency', 'quantity', 'medicationId', 'userId'],
        response,
    )) return;

    const { time, frequency, quantity, medicationId, userId } = request.body as CreateReminderBody;

    if (time === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'time is required.' });
        return;
    }

    if (!isTimeValid(time)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid time.' });
        return;
    }

    if (frequency === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'frequency is required.' });
        return;
    }

    if (typeof frequency !== 'number' || !Number.isInteger(frequency) || frequency < 1) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid frequency.' });
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

    if (medicationId === undefined) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'medicationId is required.' });
        return;
    }

    if (typeof medicationId !== 'number') {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid medicationId.' });
        return;
    }

    if (await Medication.findByPk(medicationId) === null) {
        response
            .status(HTTP_404_NOT_FOUND)
            .json({ message: 'Medication not found.' });
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

    const [hours, minutes] = time.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);

    const nextDate =  new Date();
    if (nextDate > timeDate) nextDate.setDate(nextDate.getDate() + 1);

    const newReminder = await user.createReminder({
        time,
        frequency,
        quantity,
        nextDate,
        medicationId,
    });

    response
        .status(HTTP_201_CREATED)
        .json({
            time: newReminder.time,
            frequency: newReminder.frequency,
            quantity: newReminder.quantity,
            nextDate: newReminder.nextDate,
            medicationId: newReminder.medicationId,
            userId: newReminder.userId,
        });
});

/**
 * @openapi
 * components:
 *   schemas:
 *     PatchReminder:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           description: The new reminder time.
 *           example: 12:00
 *         frequency:
 *           type: integer
 *           description: The new number of days between each reminder.
 *           example: 1
 *         nextDate:
 *           type: string
 *           description: The new date when the reminder will be triggered.
 *           example: 2025-03-13
 *         quantity:
 *           type: number
 *           description: The new quantity of medication the user must take.
 *           example: 1
 *         medicationId:
 *           type: integer
 *           description: The new id of the medication to take.
 *           example: 1
 */
type PatchReminderBody = {
    time: unknown,
    frequency: unknown,
    quantity: unknown,
    nextDate: unknown,
    medicationId: unknown,
};

export const patchReminder = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);
    assert(request.params.id !== undefined);

    if (!/^\d+$/.test(request.params.id)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid parameter: id.' });
        return;
    }

    const id = parseInt(request.params.id, 10);

    const reminder = await Reminder.findByPk(id);
    if (reminder === null) {
        response
            .status(HTTP_404_NOT_FOUND)
            .json({ mesage: 'Reminder not found.' });
        return;
    }

    if (!checkUnexpectedKeys<CreateReminderBody>(
        request.body,
        ['time', 'frequency', 'quantity', 'medicationId'],
        response,
    )) return;

    const { time, frequency, quantity, nextDate, medicationId } = request.body as PatchReminderBody;

    if (time !== undefined) {
        if (!isTimeValid(time)) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid time.' });
            return;
        }

        reminder.time = time;
    }


    if (frequency !== undefined) {
        if (typeof frequency !== 'number' || !Number.isInteger(frequency) || frequency < 1) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid frequency.' });
            return;
        }

        reminder.frequency = frequency;
    }


    if (quantity !== undefined) {
        if (typeof quantity !== 'number' || quantity <= 0.0) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid quantity.' });
            return;
        }

        reminder.quantity = quantity;
    }

    if (nextDate !== undefined) {
        if (typeof nextDate !== 'string' || !isDateValid(nextDate)) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid nextDate.' });
            return;
        }

        if (new Date(nextDate).getTime() < Date.now()) {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'nextDate must be in the future.' });
            return;
        }

        reminder.nextDate = nextDate;
    }

    if (medicationId !== undefined) {
        if (typeof medicationId !== 'number') {
            response
                .status(HTTP_400_BAD_REQUEST)
                .json({ message: 'Invalid medicationId.' });
            return;
        }

        if (await Medication.findByPk(medicationId) === null) {
            response
                .status(HTTP_404_NOT_FOUND)
                .json({ message: 'Medication not found.' });
            return;
        }

        reminder.medicationId = medicationId;
    }

    await reminder.save();


    response
        .status(HTTP_200_OK)
        .json({
            time: reminder.time,
            frequency: reminder.frequency,
            quantity: reminder.quantity,
            nextDate: reminder.nextDate,
            medicationId: reminder.medicationId,
            userId: reminder.userId,
        });
});

export const deleteReminder = asyncErrorHandler(async (request: Request, response: Response) => {
    assert(request.user !== undefined);
    assert(request.params.id !== undefined);

    if (!/^\d+$/.test(request.params.id)) {
        response
            .status(HTTP_400_BAD_REQUEST)
            .json({ message: 'Invalid parameter: id.' });
        return;
    }

    const id = parseInt(request.params.id, 10);

    const nbrOfDeletions = await Reminder.destroy({ where: { id } });
    assert(nbrOfDeletions <= 1);

    if (nbrOfDeletions === 0) {
        response
            .status(HTTP_404_NOT_FOUND)
            .json({ message: 'Reminder not found.' });
        return;
    }

    response
        .status(HTTP_200_OK)
        .json({ message: 'Reminder removed successfully.' });
});
