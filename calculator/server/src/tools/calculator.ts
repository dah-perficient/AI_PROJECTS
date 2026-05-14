import type { Tool } from '@anthropic-ai/sdk/resources';

type Expression = {
    coeff: number;
    constant: number;
};

export const CALCULATOR_TOOLS: Tool[] = [
    {
        name: 'add',
        description: 'Returns the sum of all numbers in the list.',
        input_schema: {
            type: 'object',
            properties: {
                numbers: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The list of numbers to add together.',
                },
            },
            required: ['numbers'],
        },
    },
    {
        name: 'subtract',
        description: 'Subtracts each subsequent number from the first, left to right.',
        input_schema: {
            type: 'object',
            properties: {
                numbers: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The list of numbers to subtract sequentially.',
                },
            },
            required: ['numbers'],
        },
    },
    {
        name: 'multiply',
        description:
            'For a list [a, b, c, d], returns the sum of adjacent pair products: (a*b)+(b*c)+(c*d).',
        input_schema: {
            type: 'object',
            properties: {
                numbers: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'The list of numbers to multiply as adjacent pairs and sum.',
                },
            },
            required: ['numbers'],
        },
    },
    {
        name: 'divide',
        description: 'Divides a by b. Only valid when exactly two numbers are provided.',
        input_schema: {
            type: 'object',
            properties: {
                a: {
                    type: 'number',
                    description: 'The dividend.',
                },
                b: {
                    type: 'number',
                    description: 'The divisor.',
                },
            },
            required: ['a', 'b'],
        },
    },
    {
        name: 'solve_algebra',
        description:
            'Solves a basic linear equation like "5x = 2 + x" or "3x + 2 = 11". Returns the value of x.',
        input_schema: {
            type: 'object',
            properties: {
                equation: {
                    type: 'string',
                    description: 'The linear equation string to solve (e.g. "5x = 2 + x").',
                },
            },
            required: ['equation'],
        },
    },
];

function parseExpression(expr: string): Expression {
    // Remove spaces so "+ x" and "+x" are treated identically
    const stripped = expr.replace(/\s+/g, '');
    const normalized = stripped.startsWith('-') ? stripped : `+${stripped}`;

    // Match terms: sign, optional digits/decimal, optional 'x'
    const termRegex = /([+-])(\d*\.?\d*)(x?)/gi;
    let coeff = 0;
    let constant = 0;

    let match: RegExpExecArray | null;
    while ((match = termRegex.exec(normalized)) !== null) {
        const sign = match[1] === '-' ? -1 : 1;
        const digits = match[2];
        const hasX = match[3].toLowerCase() === 'x';

        if (hasX) {
            const magnitude = digits === '' ? 1 : parseFloat(digits);
            coeff += sign * magnitude;
        } else if (digits !== '') {
            constant += sign * parseFloat(digits);
        }
    }

    return { coeff, constant };
}

function add(numbers: number[]): string {
    if (numbers.length === 0) return 'Error: no numbers provided';
    const result = numbers.reduce((acc, n) => acc + n, 0);
    return String(result);
}

function subtract(numbers: number[]): string {
    if (numbers.length === 0) return 'Error: no numbers provided';
    const result = numbers.slice(1).reduce((acc, n) => acc - n, numbers[0]);
    return String(result);
}

function multiply(numbers: number[]): string {
    if (numbers.length < 2) return 'Error: at least two numbers required for multiply';
    let result = 0;
    for (let i = 0; i < numbers.length - 1; i++) {
        result += numbers[i] * numbers[i + 1];
    }
    return String(result);
}

function divide(a: number, b: number): string {
    if (b === 0) return 'Error: division by zero';
    return String(a / b);
}

function solveAlgebra(equation: string): string {
    const sides = equation.split('=');
    if (sides.length !== 2) return 'Error: equation must contain exactly one "=" sign';

    const lhs = parseExpression(sides[0]);
    const rhs = parseExpression(sides[1]);

    // lhs.coeff * x + lhs.constant = rhs.coeff * x + rhs.constant
    // (lhs.coeff - rhs.coeff) * x = rhs.constant - lhs.constant
    const coeffDiff = lhs.coeff - rhs.coeff;
    const constantDiff = rhs.constant - lhs.constant;

    if (coeffDiff === 0) {
        if (constantDiff === 0) return 'Infinite solutions (identity)';
        return 'No solution (contradiction)';
    }

    const x = constantDiff / coeffDiff;
    return `x = ${x}`;
}

export function executeTool(name: string, input: Record<string, unknown>): string {
    switch (name) {
        case 'add': {
            const numbers = input['numbers'] as number[];
            return add(numbers);
        }
        case 'subtract': {
            const numbers = input['numbers'] as number[];
            return subtract(numbers);
        }
        case 'multiply': {
            const numbers = input['numbers'] as number[];
            return multiply(numbers);
        }
        case 'divide': {
            const a = input['a'] as number;
            const b = input['b'] as number;
            return divide(a, b);
        }
        case 'solve_algebra': {
            const equation = input['equation'] as string;
            return solveAlgebra(equation);
        }
        default:
            return `Error: unknown tool "${name}"`;
    }
}
