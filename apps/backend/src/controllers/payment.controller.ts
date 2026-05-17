import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as paymentService from '../services/payment.service';
import crypto from 'crypto';

export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.initiatePayment({
    applicationId: req.body.applicationId,
    userId: (req as any).user.id,
    callbackUrl: req.body.callbackUrl || `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
    returnUrl: req.body.returnUrl || `${process.env.FRONTEND_URL}/student/payment/callback`,
  });
  res.status(200).json({ status: 'success', data: result });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.verifyPayment(req.params['txRef'] as string);
  res.status(200).json({ status: 'success', data: payment });
});

export const getPaymentsByApplication = asyncHandler(async (req: Request, res: Response) => {
  const payments = await paymentService.getPaymentsByApplication(req.params['applicationId'] as string);
  res.status(200).json({ status: 'success', data: payments });
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  // Verify Chapa webhook signature
  const chapaSignature = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];
  const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;

  if (webhookSecret && chapaSignature) {
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== chapaSignature) {
      return res.status(401).json({ status: 'fail', message: 'Invalid webhook signature' });
    }
  }

  await paymentService.handleWebhook(req.body);
  res.status(200).json({ status: 'success' });
});
