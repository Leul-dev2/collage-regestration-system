import { Router } from 'express';
import * as programController from '../controllers/program.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', programController.getPrograms);
router.get('/:id', programController.getProgramById);

// Admin only
router.use(protect, restrictTo('SUPER_ADMIN', 'REGISTRAR'));
router.post('/', programController.createProgram);
router.patch('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

export default router;
