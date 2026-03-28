import { Prisma } from '@prisma/client';
import { PlantationParams } from '../types/plantation.js';

/**
 * Helper to clean codes of BOM and whitespace in SQL
 */
const clean = (col: string) => `REPLACE(${col}, CHR(65279), '')`;

/**
 * Builds a WHERE object compatible with Prisma's findMany and count
 */
export const buildPrismaWhere = (params: PlantationParams): any => {
    const where: any = {};

    // Support both singular and plural (array) formats
    const blocks = params.blocks || (params.block ? [params.block] : []);
    const districts = params.districts || (params.district ? [params.district] : []);

    if (blocks.length > 0) {
        where.OR = blocks.flatMap(b => {
            if (b.startsWith('08')) {
                return [{ block_code_id: b }, { block_code_id: b.substring(2) }];
            }
            return [{ block_code_id: b }];
        });
    } else if (districts.length > 0) {
        where.OR = districts.flatMap(d => {
            if (d.startsWith('08')) {
                return [{ dict_code_id: d }, { dict_code_id: d.substring(2) }];
            }
            return [{ dict_code_id: d }];
        });
    }

    if (params.type) {
        try {
            const types = params.type.split(',').map(t => BigInt(t.trim()));
            where.plantation_type_id = { in: types };
        } catch (e) { /* ignore invalid bigint */ }
    }

    if (params.department) {
        const deptId = parseInt(params.department);
        if (!isNaN(deptId)) where.goverment_departmet_id = deptId;
    }

    if (params.land_ownership) {
        const loId = parseInt(params.land_ownership);
        if (!isNaN(loId)) where.land_ownership_id = loId;
    }

    if (params.species) {
        where.planta_name_text = { contains: params.species, mode: 'insensitive' };
    }

    if (params.from_date || params.to_date) {
        where.created_at = {};
        if (params.from_date) {
            where.created_at.gte = new Date(`${params.from_date}-01-01`);
        }
        if (params.to_date) {
            where.created_at.lte = new Date(`${params.to_date}-12-31`);
        }
    }

    if (params.status !== undefined) {
        where.status = typeof params.status === 'string'
            ? params.status.toLowerCase() === 'true'
            : !!params.status;
    }

    return where;
};

/**
 * Builds a SQL fragment for Prisma.$queryRaw using parameterized queries
 */
export const buildRawSqlFilters = (params: PlantationParams, tableAlias: string = 'p'): any => {
    const conditions: any[] = [(Prisma as any).sql`1=1` as any];
    const alias = (Prisma as any).raw(tableAlias);

    const blocks = params.blocks || (params.block ? [params.block] : []);
    const districts = params.districts || (params.district ? [params.district] : []);

    if (blocks.length > 0) {
        const bList = blocks.flatMap(b => {
            if (typeof b === 'string') return b.startsWith('08') ? [b, b.substring(2)] : [b];
            return [String(b)];
        });
        conditions.push((Prisma as any).sql`${(Prisma as any).raw(clean('alias."block_code_id"'.replace('alias', tableAlias)))} IN (${(Prisma as any).join(bList)})`);
    } else if (districts.length > 0) {
        const dList = districts.flatMap(d => {
            if (typeof d === 'string') return d.startsWith('08') ? [d, d.substring(2)] : [d];
            return [String(d)];
        });
        conditions.push((Prisma as any).sql`${(Prisma as any).raw(clean('alias."dict_code_id"'.replace('alias', tableAlias)))} IN (${(Prisma as any).join(dList)})`);
    }

    if (params.type) {
        try {
            const types = params.type.split(',').map(t => BigInt(t.trim()));
            if (types.length > 0) {
                conditions.push((Prisma as any).sql`${alias}."plantation_type_id" IN (${(Prisma as any).join(types)})`);
            }
        } catch (e) { /* ignore invalid bigint types */ }
    }

    if (params.department) {
        const deptId = parseInt(params.department);
        if (!isNaN(deptId)) conditions.push((Prisma as any).sql`${alias}."goverment_departmet_id" = ${deptId}`);
    }

    if (params.land_ownership) {
        const loId = parseInt(params.land_ownership);
        if (!isNaN(loId)) conditions.push((Prisma as any).sql`${alias}."land_ownership_id" = ${loId}`);
    }

    if (params.species) {
        conditions.push((Prisma as any).sql`${alias}."planta_name_text" ILIKE ${'%' + params.species + '%'}`);
    }

    if (params.from_date) {
        conditions.push((Prisma as any).sql`${alias}."created_at" >= ${params.from_date + '-01-01'}::date`);
    }

    if (params.to_date) {
        conditions.push((Prisma as any).sql`${alias}."created_at" <= ${params.to_date + '-12-31'}::date`);
    }

    if (params.status !== undefined) {
        const val = typeof params.status === 'string' ? params.status.toLowerCase() === 'true' : !!params.status;
        conditions.push((Prisma as any).sql`${alias}."status" = ${val}`);
    }

    return (Prisma as any).join(conditions, ' AND ');
};
