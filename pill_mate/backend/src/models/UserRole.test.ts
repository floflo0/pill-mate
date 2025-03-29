import { isUserRole, UserRole } from './UserRole';

describe('isUserRole function', () => {
    it('should return true for valid user roles', () => {
        expect(isUserRole(UserRole.HELPED)).toBe(true);
        expect(isUserRole(UserRole.HELPER)).toBe(true);
    });

    it('should return false for invalid values', () => {
        expect(isUserRole(-1)).toBe(false);
        expect(isUserRole(2)).toBe(false);
        expect(isUserRole(0.5)).toBe(false);
        expect(isUserRole('')).toBe(false);
        expect(isUserRole('HELPED')).toBe(false);
        expect(isUserRole([])).toBe(false);
        expect(isUserRole({})).toBe(false);
        expect(isUserRole(null)).toBe(false);
        expect(isUserRole(undefined)).toBe(false);
    });
});
