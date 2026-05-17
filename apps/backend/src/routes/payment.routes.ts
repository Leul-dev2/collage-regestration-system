import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Webhook — no auth (Chapa calls this)
router.post('/webhook', paymentController.handleWebhook);

// Protected
router.use(protect);
router.post('/initiate', paymentController.initiatePayment);
router.get('/verify/:txRef', paymentController.verifyPayment);
router.get('/application/:applicationId', paymentController.getPaymentsByApplication);

export default router;
