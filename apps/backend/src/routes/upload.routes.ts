import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../services/upload.service';

const router = Router();

router.use(protect);

// Student uploads
router.post('/', upload.single('file'), uploadController.uploadDocument);
router.get('/application/:applicationId', uploadController.getDocumentsByApplication);
router.delete('/:id', uploadController.deleteDocument);

// Admin verify
router.patch(
  '/:id/verify',
  restrictTo('SUPER_ADMIN', 'ADMISSION_OFFICER'),
  uploadController.verifyDocument
);

export default router;
