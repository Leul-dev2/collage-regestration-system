import { Router } from 'express';
import * as institutionController from '../controllers/institution.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Public endpoint for tenant info
router.get('/current', institutionController.getCurrentInstitution);

// Admin-only management endpoints
router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

router.get('/', institutionController.getAllInstitutions);
router.post('/', institutionController.createInstitution);
router.get('/:id', institutionController.getInstitutionById);

export default router;
