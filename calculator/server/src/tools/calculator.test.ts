import { describe, expect, it } from 'vitest';

import { executeTool } from './calculator.js';

// ── add ──────────────────────────────────────────────────────────────────────

describe('add', () => {
    it('sums a list of positive numbers', () => {
        expect(executeTool('add', { numbers: [1, 2, 3] })).toBe('6');
    });

    it('sums negative numbers', () => {
        expect(executeTool('add', { numbers: [-1, -2, -3] })).toBe('-6');
    });

    it('sums mixed positive and negative numbers', () => {
        expect(executeTool('add', { numbers: [10, -3, 5] })).toBe('12');
    });

    it('sums a single number', () => {
        expect(executeTool('add', { numbers: [42] })).toBe('42');
    });

    it('sums decimals', () => {
        expect(executeTool('add', { numbers: [0.1, 0.2] })).toBe(String(0.1 + 0.2));
    });

    it('returns error for empty list', () => {
        expect(executeTool('add', { numbers: [] })).toMatch(/error/i);
    });
});

// ── subtract ─────────────────────────────────────────────────────────────────

describe('subtract', () => {
    it('subtracts sequentially from the first number', () => {
        expect(executeTool('subtract', { numbers: [10, 3, 2] })).toBe('5');
    });

    it('handles a single number', () => {
        expect(executeTool('subtract', { numbers: [7] })).toBe('7');
    });

    it('handles two numbers', () => {
        expect(executeTool('subtract', { numbers: [8, 3] })).toBe('5');
    });

    it('produces a negative result', () => {
        expect(executeTool('subtract', { numbers: [1, 10] })).toBe('-9');
    });

    it('returns error for empty list', () => {
        expect(executeTool('subtract', { numbers: [] })).toMatch(/error/i);
    });
});

// ── multiply ─────────────────────────────────────────────────────────────────

describe('multiply', () => {
    it('computes sum of adjacent pair products for [a,b,c,d]', () => {
        // (2*3) + (3*4) + (4*5) = 6 + 12 + 20 = 38
        expect(executeTool('multiply', { numbers: [2, 3, 4, 5] })).toBe('38');
    });

    it('handles exactly two numbers', () => {
        // (3*4) = 12
        expect(executeTool('multiply', { numbers: [3, 4] })).toBe('12');
    });

    it('handles zeros', () => {
        // (0*5) + (5*0) = 0
        expect(executeTool('multiply', { numbers: [0, 5, 0] })).toBe('0');
    });

    it('handles negative numbers', () => {
        // (-2*3) + (3*-1) = -6 + -3 = -9
        expect(executeTool('multiply', { numbers: [-2, 3, -1] })).toBe('-9');
    });

    it('returns error for fewer than two numbers', () => {
        expect(executeTool('multiply', { numbers: [5] })).toMatch(/error/i);
    });
});

// ── divide ───────────────────────────────────────────────────────────────────

describe('divide', () => {
    it('divides a by b', () => {
        expect(executeTool('divide', { a: 10, b: 2 })).toBe('5');
    });

    it('returns a decimal result', () => {
        expect(executeTool('divide', { a: 1, b: 4 })).toBe('0.25');
    });

    it('handles negative dividend', () => {
        expect(executeTool('divide', { a: -9, b: 3 })).toBe('-3');
    });

    it('handles negative divisor', () => {
        expect(executeTool('divide', { a: 9, b: -3 })).toBe('-3');
    });

    it('returns error when dividing by zero', () => {
        expect(executeTool('divide', { a: 5, b: 0 })).toMatch(/error/i);
    });
});

// ── solve_algebra ─────────────────────────────────────────────────────────────

describe('solve_algebra', () => {
    it('solves a basic equation: 5x = 2 + x', () => {
        // 5x - x = 2  →  4x = 2  →  x = 0.5
        expect(executeTool('solve_algebra', { equation: '5x = 2 + x' })).toBe('x = 0.5');
    });

    it('solves 3x + 2 = 11', () => {
        // 3x = 9  →  x = 3
        expect(executeTool('solve_algebra', { equation: '3x + 2 = 11' })).toBe('x = 3');
    });

    it('solves x = 7', () => {
        expect(executeTool('solve_algebra', { equation: 'x = 7' })).toBe('x = 7');
    });

    it('solves 2x - 4 = 0', () => {
        expect(executeTool('solve_algebra', { equation: '2x - 4 = 0' })).toBe('x = 2');
    });

    it('reports infinite solutions for an identity', () => {
        expect(executeTool('solve_algebra', { equation: 'x = x' })).toMatch(/infinite/i);
    });

    it('reports no solution for a contradiction', () => {
        // 2x + 1 = 2x + 3  →  1 = 3
        expect(executeTool('solve_algebra', { equation: '2x + 1 = 2x + 3' })).toMatch(
            /no solution/i,
        );
    });

    it('returns error when there is no "=" sign', () => {
        expect(executeTool('solve_algebra', { equation: '3x + 2' })).toMatch(/error/i);
    });
});

// ── executeTool unknown name ──────────────────────────────────────────────────

describe('executeTool', () => {
    it('returns error for unknown tool name', () => {
        expect(executeTool('unknown', {})).toMatch(/error/i);
    });
});
