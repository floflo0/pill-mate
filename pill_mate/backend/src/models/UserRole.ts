/**
 * @openapi
 * components:
 *   schemas:
 *     UserRole:
 *       type: integer
 *       description: >
 *          The role of the user.
 *           * `0` - Helped, the user will be helped by the application.
 *           * `1` - Helper, the user will help an other user.
 *       enum: [0, 1]
 *       example: 1
 */
export enum UserRole {
    HELPED,
    HELPER,
}

export const isUserRole = (value: unknown): value is UserRole => {
    return typeof value === 'number' && value in UserRole;
};
