import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { PlantationParams, SummaryStats } from '../types/plantation.js';
import { buildRawSqlFilters } from '../utils/filterBuilder.js';

/**
 * Helper to clean codes of BOM and whitespace in SQL
 */
const clean = (col: string) => `REPLACE(${col}, CHR(65279), '')`;

/**
 * Fetches stats by district
 */
export const getDistrictStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params, 'p');

    return await prisma.$queryRaw`
        SELECT 
            ${(Prisma as any).raw(clean('d."DISTRICT_C"'))} as code,
            d."DISTRICT_N" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM "portaldash_districtlist" d
        LEFT JOIN "api_blockplantation" p ON ${(Prisma as any).raw(clean('d."DISTRICT_C"'))} = ${(Prisma as any).raw(clean('p."dict_code_id"'))} AND ${whereSql}
        GROUP BY d."DISTRICT_C", d."DISTRICT_N"
        ORDER BY name
    `;
};

/**
 * Fetches stats by block (robustly handles new districts like Balotra)
 */
export const getBlockStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params, 'p');
    const district = String(params.district || '');
    const distCode = district ? district.replace(/^08/, '').replace(/\ufeff/g, '').trim() : null;
    const longDistCode = distCode ? '08' + distCode : null;

    return await prisma.$queryRaw`
        SELECT 
            ${(Prisma as any).raw(clean('b."block_id"'))} as code,
            b."block_name" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM "api_nursery_blocklist" b
        LEFT JOIN "api_blockplantation" p ON ${(Prisma as any).raw(clean('b."block_id"'))} = ${(Prisma as any).raw(clean('p."block_code_id"'))} AND ${whereSql}
        WHERE 1=1
        ${distCode ? (Prisma as any).sql`AND (${(Prisma as any).raw(clean('b."District_id"'))} = ${distCode} OR ${(Prisma as any).raw(clean('b."District_id"'))} = ${longDistCode})` : (Prisma as any).empty}
        GROUP BY b."block_id", b."block_name"
        ORDER BY name
    `;
};

/**
 * Fetches stats by Gram Panchayat
 */
export const getGPStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params, 'p');
    const block = String(params.block || '');
    const blockCode = block ? block.replace(/\ufeff/g, '').trim() : null;

    return await prisma.$queryRaw`
        SELECT 
            ${(Prisma as any).raw(clean('g."GP_FINAL_C"'))} as code,
            g."GP_FINAL_N" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM "portaldash_gpfinallist" g
        INNER JOIN "api_nursery_grampanchayatlist" m ON ${(Prisma as any).raw(clean('g."GP_FINAL_C"'))} = ${(Prisma as any).raw(clean('m."gp_id"'))}
        LEFT JOIN "api_blockplantation" p ON ${(Prisma as any).raw(clean('g."GP_FINAL_C"'))} = ${(Prisma as any).raw(clean('p."gp_code_id"'))} AND ${whereSql}
        WHERE 1=1
        ${blockCode ? (Prisma as any).sql`AND ${(Prisma as any).raw(clean('m."block_id"'))} = ${blockCode}` : (Prisma as any).empty}
        GROUP BY g."GP_FINAL_C", g."GP_FINAL_N"
        ORDER BY name
    `;
};

/**
 * Fetches summary statistics for cards
 */
export const getSummaryStats = async (params: PlantationParams): Promise<any> => {
    const whereSql = buildRawSqlFilters(params, 'p');

    // 1. Get Totals
    const totals: any[] = await prisma.$queryRaw`
        SELECT 
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as total_sites,
            COUNT(DISTINCT p."planta_name_text") as total_species,
            COUNT(p."id") FILTER (WHERE p."status" = true) as verified_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants
        FROM "api_blockplantation" p
        WHERE ${whereSql}
    `;

    // 2. Get Dept Breakdown
    const deptData: any[] = await prisma.$queryRaw`
        SELECT d."department_name", COUNT(p."id") as count
        FROM "api_blockplantation" p
        JOIN "api_gov_department" d ON p."goverment_departmet_id" = d."id"
        WHERE ${whereSql}
        GROUP BY d."department_name"
        ORDER BY count DESC
    `;

    const by_dept: Record<string, number> = {};
    deptData.forEach(d => { by_dept[d.department_name] = Number(d.count); });

    const t = totals[0] || {};
    return [{
        total_plants: t.total_plants || 0,
        total_sites: Number(t.total_sites || 0),
        total_species: Number(t.total_species || 0),
        verified_count: Number(t.verified_count || 0),
        by_type: {
            "Block": Number(t.block_plants || 0),
            "Miyawaki": Number(t.miyawaki_plants || 0),
            "Fal Vatika": Number(t.fal_vatika_plants || 0),
            "Individual": 0
        },
        by_dept
    }];
};
