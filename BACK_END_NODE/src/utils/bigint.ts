/**
 * Recursively serializes BigInt, Date and Prisma Decimal objects for JSON responses.
 * Uses a WeakSet to handle circular references.
 */
export const serializeBigInt = (obj: any, seen = new WeakSet()): any => {
    if (obj === null || obj === undefined) return obj;

    // Handle primitive types
    if (typeof obj === 'bigint') {
        return Number(obj);
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle circular references
    if (seen.has(obj)) return '[Circular]';
    seen.add(obj);

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => serializeBigInt(item, seen));
    }

    // Handle Dates
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    // Handle Prisma Decimal or Decimal.js objects
    // They usually have a .toNumber() method or fixed d, s, e properties
    if (typeof obj.toNumber === 'function') {
        return obj.toNumber();
    }
    if (obj.d && Array.isArray(obj.d) && obj.s !== undefined && obj.e !== undefined) {
        return Number(obj);
    }

    // Handle generic objects
    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serializeBigInt(obj[key], seen);
        }
    }
    return newObj;
};
