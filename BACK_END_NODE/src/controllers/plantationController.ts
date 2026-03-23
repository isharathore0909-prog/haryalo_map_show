import type { Request, Response } from 'express';
import * as plantationService from '../services/plantationService.js';
import { serializeBigInt } from '../utils/bigint.js';

export const getDistrictStats = async (req: Request, res: Response) => {
    try {
        const stats = await plantationService.getDistrictStats(req.query as any);
        res.json(serializeBigInt(stats));
    } catch (error) {
        console.error('Error fetching district stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getBlockStats = async (req: Request, res: Response) => {
    try {
        const stats = await plantationService.getBlockStats(req.query as any);
        res.json(serializeBigInt(stats));
    } catch (error) {
        console.error('Error fetching block stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getGPStats = async (req: Request, res: Response) => {
    try {
        const stats = await plantationService.getGPStats(req.query as any);
        res.json(serializeBigInt(stats));
    } catch (error) {
        console.error('Error fetching GP stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPlantationPoints = async (req: Request, res: Response) => {
    try {
        const points = await plantationService.getFilteredPlantations(req.query as any);

        // Transform to match Django serializer exactly if needed
        const transformed = points.map((p: any) => ({
            id: p.id,
            location_lat: p.location_lat,
            location_long: p.location_long,
            plantation_type: p.plantation_type_id,
            plantation_type_name: p.api_plantationtype?.plantation_type_name,
            number_of_plants: p.number_of_plants,
            gp_code: p.gp_code_id,
            gp_name: p.portaldash_gpfinallist?.GP_FINAL_N,
            block_name: p.portaldash_blocklist?.BLOCK_N,
            district_name: p.portaldash_districtlist?.DISTRICT_N,
            planta_name_text: p.planta_name_text
        }));

        res.json(serializeBigInt(transformed));
    } catch (error) {
        console.error('Error fetching plantation points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSummaryStats = async (req: Request, res: Response) => {
    try {
        const summary = await plantationService.getSummaryStats(req.query as any);
        res.json(serializeBigInt(summary));
    } catch (error) {
        console.error('Error fetching summary stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSpeciesList = async (req: Request, res: Response) => {
    try {
        const species = await plantationService.getSpeciesList();
        res.json(species);
    } catch (error) {
        console.error('Error fetching species list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDepartmentList = async (req: Request, res: Response) => {
    try {
        const deps = await plantationService.getDepartmentList();
        res.json(deps);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getLandOwnershipList = async (req: Request, res: Response) => {
    try {
        const land = await plantationService.getLandOwnershipList();
        res.json(land);
    } catch (error) {
        console.error('Error fetching land ownership:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
