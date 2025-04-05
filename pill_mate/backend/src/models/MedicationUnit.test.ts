import { isMedicationUnit, MedicationUnit } from './MedicationUnit';

describe('isMedicationUnit function', () => {
    it('should return true for valid medication unit', () => {
        expect(isMedicationUnit(MedicationUnit.TABLET)).toBe(true);
        expect(isMedicationUnit(MedicationUnit.PILL)).toBe(true);
        expect(isMedicationUnit(MedicationUnit.ML)).toBe(true);
        expect(isMedicationUnit(MedicationUnit.DROPS)).toBe(true);
        expect(isMedicationUnit(MedicationUnit.UNIT)).toBe(true);
    });

    it('should return false for invalid values', () => {
        expect(isMedicationUnit(-1)).toBe(false);
        expect(isMedicationUnit(5)).toBe(false);
        expect(isMedicationUnit(0.5)).toBe(false);
        expect(isMedicationUnit('')).toBe(false);
        expect(isMedicationUnit('TABLET')).toBe(false);
        expect(isMedicationUnit([])).toBe(false);
        expect(isMedicationUnit({})).toBe(false);
        expect(isMedicationUnit(null)).toBe(false);
        expect(isMedicationUnit(undefined)).toBe(false);
    });
});
