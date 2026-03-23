import { Prisma } from '@prisma/client';
import { PlantationParams } from '../types/plantation.js';

/**
 * Builds a WHERE object compatible with Prisma's findMany and count
 */
export const buildPrismaWhere = (params: PlantationParams): any => {
    const where: any = {};

    // Handles both 08-prefixed and short codes for districts/blocks
    if (params.block) {
        if (params.block.length > 3 && params.block.startsWith('08')) {
            const shortBlock = params.block.substring(2);
            where.OR = [
                { block_code_id: params.block },
                { block_code_id: shortBlock },
            ];
        } else {
            where.block_code_id = params.block;
        }
    } else if (params.district) {
        if (params.district.length > 2 && params.district.startsWith('08')) {
            const shortDist = params.district.substring(2);
            where.OR = [
                { dict_code_id: params.district },
                { dict_code_id: shortDist }
            ];
        } else {
            where.dict_code_id = params.district;
        }
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

    if (params.block) {
        if (params.block.length > 3 && params.block.startsWith('08')) {
            const shortBlock = params.block.substring(2);
            conditions.push((Prisma as any).sql`(${alias}."block_code_id" = ${params.block} OR ${alias}."block_code_id" = ${shortBlock})`);
        } else {
            conditions.push((Prisma as any).sql`${alias}."block_code_id" = ${params.block}`);
        }
    } else if (params.district) {
        if (params.district.length > 2 && params.district.startsWith('08')) {
            const shortDist = params.district.substring(2);
            conditions.push((Prisma as any).sql`(${alias}."dict_code_id" = ${params.district} OR ${alias}."dict_code_id" = ${shortDist})`);
        } else {
            conditions.push((Prisma as any).sql`${alias}."dict_code_id" = ${params.district}`);
        }
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
