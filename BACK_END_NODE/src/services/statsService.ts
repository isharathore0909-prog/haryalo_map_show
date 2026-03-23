import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { PlantationParams, SummaryStats } from '../types/plantation.js';
import { buildPrismaWhere, buildRawSqlFilters } from '../utils/filterBuilder.js';

export const getDistrictStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params);
    return await prisma.$queryRaw`
        SELECT 
            REPLACE(d."DISTRICT_C", CHR(65279), '') as code,
            d."DISTRICT_N" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Individual%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as individual_plants,
            COALESCE(SUM(CASE WHEN (t."plantation_type_name" ILIKE '%Block%' OR t."plantation_type_name" ILIKE '%Community%' OR t."plantation_type_name" ILIKE '%Institutional%') AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Miyawaki%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Fal Vatika%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants
        FROM "portaldash_districtlist" d
        LEFT JOIN "api_blockplantation" p ON d."DISTRICT_C" = p."dict_code_id" AND ${whereSql}
        LEFT JOIN "api_plantationtype" t ON p."plantation_type_id" = t."id"
        GROUP BY d."DISTRICT_C", d."DISTRICT_N"
        ORDER BY name
    `;
};

export const getBlockStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params);
    const district = String(params.district || '');
    const distCode = district ? district.replace(/^08/, '').replace(/\ufeff/g, '') : null;

    return await prisma.$queryRaw`
        SELECT 
            REPLACE(b."BLOCK_C", CHR(65279), '') as code,
            b."BLOCK_N" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Individual%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as individual_plants,
            COALESCE(SUM(CASE WHEN (t."plantation_type_name" ILIKE '%Block%' OR t."plantation_type_name" ILIKE '%Community%' OR t."plantation_type_name" ILIKE '%Institutional%') AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Miyawaki%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Fal Vatika%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants
        FROM "portaldash_blocklist" b
        LEFT JOIN "api_blockplantation" p ON b."BLOCK_C" = p."block_code_id" AND ${whereSql}
        LEFT JOIN "api_plantationtype" t ON p."plantation_type_id" = t."id"
        WHERE 1=1
        ${distCode ? (Prisma as any).raw(`AND REPLACE(b."BLOCK_C", CHR(65279), '') LIKE '08${distCode}%'`) : (Prisma as any).raw('')}
        GROUP BY b."BLOCK_C", b."BLOCK_N"
        ORDER BY name
    `;
};

export const getGPStats = async (params: PlantationParams) => {
    const whereSql = buildRawSqlFilters(params);
    const block = String(params.block || '');
    const blockCode = block ? block.replace(/^08/, '').replace(/\ufeff/g, '') : null;

    return await prisma.$queryRaw`
        SELECT 
            REPLACE(g."GP_FINAL_C", CHR(65279), '') as code,
            g."GP_FINAL_N" as name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Individual%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as individual_plants,
            COALESCE(SUM(CASE WHEN (t."plantation_type_name" ILIKE '%Block%' OR t."plantation_type_name" ILIKE '%Community%' OR t."plantation_type_name" ILIKE '%Institutional%') AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Miyawaki%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN t."plantation_type_name" ILIKE '%Fal Vatika%' AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants
        FROM "portaldash_gpfinallist" g
        LEFT JOIN "api_blockplantation" p ON g."GP_FINAL_C" = p."gp_code_id" AND ${whereSql}
        LEFT JOIN "api_plantationtype" t ON p."plantation_type_id" = t."id"
        WHERE 1=1
        ${blockCode ? (Prisma as any).raw(`AND REPLACE(g."GP_FINAL_C", CHR(65279), '') LIKE '08${blockCode}%'`) : (Prisma as any).raw('')}
        GROUP BY g."GP_FINAL_C", g."GP_FINAL_N"
        ORDER BY name
    `;
};

export const getSummaryStats = async (params: PlantationParams): Promise<SummaryStats> => {
    const where = buildPrismaWhere(params);
    const whereSql = buildRawSqlFilters(params);

    const [countResult, totals, typeStats, deptStats, verifiedCount] = await Promise.all([
        prisma.api_blockplantation.count({ where }),
        prisma.$queryRaw<any[]>`
            SELECT 
                SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END) as total_plants,
                COUNT(DISTINCT p."planta_name_text") as total_species
            FROM "api_blockplantation" p
            WHERE ${whereSql}
        `,
        prisma.$queryRaw<any[]>`
            SELECT t."plantation_type_name" as type_name, COUNT(p."id") as count
            FROM "api_blockplantation" p
            JOIN "api_plantationtype" t ON p."plantation_type_id" = t."id"
            WHERE ${whereSql}
            GROUP BY t."plantation_type_name"
        `,
        prisma.$queryRaw<any[]>`
            SELECT d."department_name" as dept_name, COUNT(p."id") as count
            FROM "api_blockplantation" p
            JOIN "api_gov_department" d ON p."goverment_departmet_id" = d."id"
            WHERE ${whereSql}
            GROUP BY d."department_name"
            ORDER BY count DESC
        `,
        prisma.api_blockplantation.count({
            where: { ...where, status: true }
        })
    ]);

    return {
        total_sites: countResult,
        total_plants: Number(totals[0]?.total_plants || 0),
        total_species: Number(totals[0]?.total_species || 0),
        by_type: typeStats.reduce((acc: Record<string, number>, curr: any) => ({ ...acc, [curr.type_name]: Number(curr.count) }), {}),
        by_dept: deptStats.reduce((acc: Record<string, number>, curr: any) => ({ ...acc, [curr.dept_name]: Number(curr.count) }), {}),
        verified_count: verifiedCount
    };
};
