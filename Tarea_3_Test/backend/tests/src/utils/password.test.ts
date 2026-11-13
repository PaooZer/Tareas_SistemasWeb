import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, comparePassword } from '../../../src/utils/password.util.ts';

describe('password util test', ()=>{
    const password1 = 'ClaveUno123!';
    const password2 = 'ClaveDos456!';

    let hash1: string;
    let hash2: string;

    beforeAll(async ()=>{
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
    });

    it('should generate non-empty hashes different from the original passwords', ()=>{
        expect(typeof hash1).toBe('string');
        expect(hash1.length).toBeGreaterThan(0);
        expect(hash1).not.toBe(password1);

        expect(typeof hash2).toBe('string');
        expect(hash2.length).toBeGreaterThan(0);
        expect(hash2).not.toBe(password2);
    });

    it('should return true for the correct password', async ()=>{
        const result1 = await comparePassword(password1, hash1);
        const result2 = await comparePassword(password2, hash2);
        expect(result1).toBe(true);
        expect(result2).toBe(true);
    });

    it('should return false for an incorrect password', async ()=>{
        const result1 = await comparePassword(password2, hash1);
        const result2 = await comparePassword(password1, hash2);
        expect(result1).toBe(false);
        expect(result2).toBe(false);
    });
});