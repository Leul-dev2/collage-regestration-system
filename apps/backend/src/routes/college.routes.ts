import { Router } from 'express';
import * as collegeController from '../controllers/college.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Public
router.get('/', collegeController.getColleges);
router.get('/:id', collegeController.getCollegeById);

// Admin only
router.use(protect, restrictTo('SUPER_ADMIN', 'REGISTRAR'));
router.get('/admin/all', collegeController.getAllCollegesAdmin);
router.post('/', collegeController.createCollege);
router.patch('/:id', collegeController.updateCollege);
router.delete('/:id', collegeController.deleteCollege);

export default router;
