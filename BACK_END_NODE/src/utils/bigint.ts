export const serializeBigInt = (obj: any, seen = new WeakSet()): any => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'bigint') {
        return Number(obj);
    }

    if (typeof obj === 'object') {
        if (seen.has(obj)) return '[Circular]';
        seen.add(obj);

        if (Array.isArray(obj)) {
            return obj.map(item => serializeBigInt(item, seen));
        }

        // Handle special types that shouldn't be recursed into
        if (obj instanceof Date) {
            return obj.toISOString();
        }

        // Handle Prisma Decimal
        if (obj.d && obj.s && obj.e) {
            return Number(obj);
        }

        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = serializeBigInt(obj[key], seen);
            }
        }
        return newObj;
    }

    return obj;
};
