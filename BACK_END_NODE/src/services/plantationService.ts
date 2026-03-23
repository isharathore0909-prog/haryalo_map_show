import prisma from '../utils/prisma.js';
import { PlantationParams } from '../types/plantation.js';
import { getCached } from '../utils/cache.js';
import { buildPrismaWhere } from '../utils/filterBuilder.js';

// Re-export stats functionality for backward compatibility or direct use
export * from './statsService.js';

/**
 * Fetches filtered plantation points for map display
 */
export const getFilteredPlantations = async (params: PlantationParams) => {
    const cacheKey = `plantations:${JSON.stringify(params)}`;
    return await getCached(cacheKey, async () => {
        const where = buildPrismaWhere(params);
        return await prisma.api_blockplantation.findMany({
            where,
            select: {
                id: true,
                location_lat: true,
                location_long: true,
                plantation_type_id: true,
                api_plantationtype: {
                    select: { plantation_type_name: true }
                },
                number_of_plants: true,
                gp_code_id: true,
                portaldash_gpfinallist: {
                    select: { GP_FINAL_N: true }
                },
                block_code_id: true,
                portaldash_blocklist: {
                    select: { BLOCK_N: true }
                },
                dict_code_id: true,
                portaldash_districtlist: {
                    select: { DISTRICT_N: true }
                },
                planta_name_text: true,
            },
            take: 3000,
        });
    });
};

/**
 * Metadata lists with caching
 */

export const getSpeciesList = async () => {
    return await getCached('species', async () => {
        const species: any[] = await prisma.$queryRaw`
            SELECT DISTINCT TRIM("planta_name_text") as name
            FROM "api_blockplantation"
            WHERE "planta_name_text" IS NOT NULL
            LIMIT 500
        `;
        return species
            .filter(s => s.name)
            .map(s => ({ id: s.name, label: s.name }));
    });
};

export const getDepartmentList = async () => {
    return await getCached('departments', async () => {
        return await prisma.api_gov_department.findMany({
            select: { id: true, department_name: true },
            orderBy: { department_name: 'asc' }
        });
    });
};

export const getLandOwnershipList = async () => {
    return await getCached('land_ownership', async () => {
        return await prisma.api_land_ownershipby_gov_ngo.findMany({
            select: { id: true, land_ownership: true },
            orderBy: { land_ownership: 'asc' }
        });
    });
};
