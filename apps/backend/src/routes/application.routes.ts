import { Router } from 'express';
import * as applicationController from '../controllers/application.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

// Student routes
router.get('/my', applicationController.getMyApplications);
router.get('/check-duplicate', applicationController.checkDuplicate);
router.post('/', applicationController.createApplication);
router.patch('/:id/draft', applicationController.saveDraft);
router.patch('/:id/submit', applicationController.submitApplication);
router.get('/:id/confirmation', applicationController.downloadConfirmation);
router.get('/:id', applicationController.getApplicationById);

// Admin routes
router.get(
  '/',
  restrictTo('SUPER_ADMIN', 'ADMISSION_OFFICER', 'REGISTRAR', 'FINANCE_OFFICER'),
  applicationController.getAllApplications
);
router.patch(
  '/:id/status',
  restrictTo('SUPER_ADMIN', 'ADMISSION_OFFICER', 'REGISTRAR'),
  applicationController.updateApplicationStatus
);

export default router;
