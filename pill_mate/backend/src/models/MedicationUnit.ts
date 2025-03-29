/**
 * @openapi
 * components:
 *   schemas:
 *     MedicationUnit:
 *       type: integer
 *       description: >
 *          The unit of the quantity of medication.
 *           * `0` - Tablet.
 *           * `1` - Capsule.
 *           * `2` - Ml, milliliter.
 *           * `3` - Drops.
 *           * `4` - Unit, no unit.
 *       enum: [0, 1, 2, 3, 4]
 *       example: 1
 */
export enum MedicationUnit {
    TABLET,
    CAPSULE,
    ML,
    DROPS,
    UNIT,
}

export const isMedicationUnit = (value: unknown): value is MedicationUnit => {
    return typeof value === 'number' && value in MedicationUnit;
};
