import { describe, it, expect } from 'vitest';
import { generateSixDigitCode } from '../../../src/utils/generateCode.util.ts';

describe('generate code test', ()=>{
    it('should generate a six digit code', ()=>{
        const code = generateSixDigitCode();
        expect(code).toMatch(/^\d{6}$/);
    });

    it('should generate unique codes', ()=>{
        const code1 = generateSixDigitCode();
        const code2 = generateSixDigitCode();
        expect(code1).not.toBe(code2);
    });

    it('should generate codes between 100000 and 999999', ()=>{
        const code = Number(generateSixDigitCode());
        expect(code).toBeGreaterThanOrEqual(100000);
        expect(code).toBeLessThanOrEqual(999999);
    });
});