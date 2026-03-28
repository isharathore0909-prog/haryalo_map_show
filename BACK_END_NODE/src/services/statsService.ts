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
        WITH dists AS (
            SELECT 
                ${(Prisma as any).raw(clean('"DISTRICT_C"'))} as code,
                "DISTRICT_N" as name
            FROM "portaldash_districtlist"
        )
        SELECT 
            d.code,
            d.name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM dists d
        LEFT JOIN "api_blockplantation" p ON d.code = p."dict_code_id" AND ${whereSql}
        GROUP BY d.code, d.name
        ORDER BY d.name
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
        WITH blks AS (
            SELECT 
                ${(Prisma as any).raw(clean('"block_id"'))} as code,
                "block_name" as name,
                ${(Prisma as any).raw(clean('"District_id"'))} as dist_id
            FROM "api_nursery_blocklist"
        )
        SELECT 
            b.code,
            b.name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM blks b
        LEFT JOIN "api_blockplantation" p ON b.code = p."block_code_id" AND ${whereSql}
        WHERE 1=1
        ${distCode ? (Prisma as any).sql`AND (b.dist_id = ${distCode} OR b.dist_id = ${longDistCode})` : (Prisma as any).empty}
        GROUP BY b.code, b.name
        ORDER BY b.name
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
        WITH gps AS (
            SELECT 
                ${(Prisma as any).raw(clean('g."GP_FINAL_C"'))} as code,
                g."GP_FINAL_N" as name,
                ${(Prisma as any).raw(clean('m."block_id"'))} as block_id
            FROM "portaldash_gpfinallist" g
            INNER JOIN "api_nursery_grampanchayatlist" m ON ${(Prisma as any).raw(clean('g."GP_FINAL_C"'))} = ${(Prisma as any).raw(clean('m."gp_id"'))}
        )
        SELECT 
            g.code,
            g.name,
            COALESCE(SUM(CASE WHEN p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as total_plants,
            COUNT(p."id") as site_count,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 1 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as block_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 2 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as miyawaki_plants,
            COALESCE(SUM(CASE WHEN p."plantation_type_id" = 3 AND p."number_of_plants" ~ '^[0-9]+$' THEN CAST(p."number_of_plants" AS BIGINT) ELSE 0 END), 0) as fal_vatika_plants,
            0 as individual_plants
        FROM gps g
        LEFT JOIN "api_blockplantation" p ON g.code = p."gp_code_id" AND ${whereSql}
        WHERE 1=1
        ${blockCode ? (Prisma as any).sql`AND g.block_id = ${blockCode}` : (Prisma as any).empty}
        GROUP BY g.code, g.name
        ORDER BY g.name
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
    deptData.forEach(d => {
        if (d.department_name) {
            by_dept[d.department_name] = Number(d.count);
        }
    });

    const t = totals[0] || {};
    return [{
        total_plants: Number(t.total_plants || 0),
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

/**
 * Calculates the difference between two sets of filters for change detection
 */
export const getComparisonDiff = async (paramsA: PlantationParams, paramsB: PlantationParams) => {
    const [statsA] = await getSummaryStats(paramsA);
    const [statsB] = await getSummaryStats(paramsB);

    const calculateDelta = (valB: number, valA: number) => {
        const delta = valB - valA;
        const percent = valA > 0 ? (delta / valA) * 100 : 0;
        return { value: delta, percent: Number(percent.toFixed(2)) };
    };

    const diff = {
        total_plants: calculateDelta(statsB.total_plants, statsA.total_plants),
        total_sites: calculateDelta(statsB.total_sites, statsA.total_sites),
        total_species: calculateDelta(statsB.total_species, statsA.total_species),
        verified_count: calculateDelta(statsB.verified_count, statsA.verified_count),
        by_type: {} as any,
        by_dept: {} as any
    };

    // Calculate deltas for types
    const allTypes = new Set([...Object.keys(statsA.by_type), ...Object.keys(statsB.by_type)]);
    allTypes.forEach(type => {
        diff.by_type[type] = calculateDelta(statsB.by_type[type] || 0, statsA.by_type[type] || 0);
    });

    // Calculate deltas for departments (top 10 by change)
    const allDepts = new Set([...Object.keys(statsA.by_dept), ...Object.keys(statsB.by_dept)]);
    allDepts.forEach(dept => {
        const delta = (statsB.by_dept[dept] || 0) - (statsA.by_dept[dept] || 0);
        if (delta !== 0) {
            diff.by_dept[dept] = calculateDelta(statsB.by_dept[dept] || 0, statsA.by_dept[dept] || 0);
        }
    });

    // Regional Diff for the Map
    let regionalA: any[] = [];
    let regionalB: any[] = [];

    if ((paramsB.blocks && paramsB.blocks.length > 0) || paramsB.block) {
        regionalA = await getGPStats(paramsA) as any[];
        regionalB = await getGPStats(paramsB) as any[];
    } else if ((paramsB.districts && paramsB.districts.length > 0) || paramsB.district) {
        regionalA = await getBlockStats(paramsA) as any[];
        regionalB = await getBlockStats(paramsB) as any[];
    } else {
        regionalA = await getDistrictStats(paramsA) as any[];
        regionalB = await getDistrictStats(paramsB) as any[];
    }

    const regionalDiff: Record<string, any> = {};
    const mapRegA = new Map(regionalA.map(r => [String(r.code), r]));

    regionalB.forEach(rB => {
        const code = String(rB.code);
        const rA = mapRegA.get(code) || { total_plants: 0, site_count: 0 };
        regionalDiff[code] = {
            total_plants: calculateDelta(Number(rB.total_plants), Number(rA.total_plants)),
            site_count: calculateDelta(Number(rB.site_count), Number(rA.site_count))
        };
    });

    // Point Deltas (New vs Lost)
    let pointDeltas = { newPlantations: [] as any[], lostPlantations: [] as any[] };

    // Only fetch individual points if we are scoped to at least a district or block to avoid massive payloads
    if (paramsB.district || paramsB.districts?.length || paramsB.block || paramsB.blocks?.length) {
        const whereA = buildRawSqlFilters(paramsA, 'p');
        const whereB = buildRawSqlFilters(paramsB, 'p');

        const fetchPoints = async (where: any) => {
            return await prisma.$queryRaw`
                SELECT id, location_lat, location_long, plantation_type_id as "plantation_type"
                FROM "api_blockplantation" p
                WHERE ${where}
                LIMIT 2000
            ` as any[];
        };

        const [ptsA, ptsB] = await Promise.all([fetchPoints(whereA), fetchPoints(whereB)]);
        const mapPtsA = new Map(ptsA.map(p => [String(p.id), p]));
        const mapPtsB = new Map(ptsB.map(p => [String(p.id), p]));

        pointDeltas.newPlantations = ptsB.filter(p => !mapPtsA.has(String(p.id)));
        pointDeltas.lostPlantations = ptsA.filter(p => !mapPtsB.has(String(p.id)));
    }

    return {
        sideA: statsA,
        sideB: statsB,
        diff,
        regionalDiff,
        ...pointDeltas
    };
};
