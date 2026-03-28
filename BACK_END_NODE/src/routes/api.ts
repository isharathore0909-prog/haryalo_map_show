import { Router } from 'express';
import * as plantationController from '../controllers/plantationController.js';

const router = Router();

router.get('/district-stats', plantationController.getDistrictStats);
router.get('/block-stats', plantationController.getBlockStats);
router.get('/gp-stats', plantationController.getGPStats);
router.get('/plantation-points', plantationController.getPlantationPoints);
router.get('/summary-stats', plantationController.getSummaryStats);
router.get('/species', plantationController.getSpeciesList);
router.get('/departments', plantationController.getDepartmentList);
router.get('/land-ownership', plantationController.getLandOwnershipList);
router.post('/comparison-stats', plantationController.getComparisonStats);

export default router;
