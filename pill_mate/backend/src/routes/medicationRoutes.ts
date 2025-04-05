import { Router } from 'express';
import * as medicationController from '../controllers/medicationController';
import { requireUser } from '../middlewares/requireUser';

const router = Router();

/**
 * @openapi
 * /medication/:
 *   get:
 *     summary: Get the medications of the currently logged user.
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: Medications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               description: The list of the user's medications.
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       401:
 *         description: The user is not registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 */
router.get('/', requireUser, medicationController.getMedications);

/**
 * @openapi
 * /medication/:
 *   post:
 *     summary: Create a new medication.
 *     tags: [Medications]
 *     responses:
 *       201:
 *         description: Medication created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       401:
 *         description: The user is not registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       403:
 *         description: The user don't have the permission to access to other users' medications.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       404:
 *         description: Helped user not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 */
router.post('/', requireUser, medicationController.createMedication);

/**
 * @openapi
 * /medication/{id}:
 *   patch:
 *     summary: Modify a medication.
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Unique identifier of the medication.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatchMedication'
 *     responses:
 *       200:
 *         description: Medication modified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       401:
 *         description: The user is not registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       404:
 *         description: Medication not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 */
router.patch('/:id', requireUser, medicationController.patchMedication);

/**
 * @openapi
 * /medication/{id}:
 *   delete:
 *     summary: Delete a medication.
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Unique identifier of the medication.
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Medication deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       401:
 *         description: The user is not registered.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 *       404:
 *         description: Medication not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessageResponse'
 */
router.delete('/:id', requireUser, medicationController.deleteMedication);

export default router;
