import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import crypto from 'crypto';

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

interface InitiatePaymentData {
  applicationId: string;
  userId: string;
  callbackUrl: string;
  returnUrl: string;
}

export const initiatePayment = async (data: InitiatePaymentData) => {
  const { applicationId, userId, callbackUrl, returnUrl } = data;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      program: true,
      user: { include: { studentProfile: true } },
    },
  });

  if (!application) throw new AppError('Application not found', 404);
  if (application.userId !== userId) throw new AppError('Not authorized', 403);
  if (application.status !== 'PENDING_PAYMENT') {
    throw new AppError('Application is not in pending payment status', 400);
  }

  // Check for existing successful payment
  const existingPayment = await prisma.payment.findFirst({
    where: { applicationId, status: 'SUCCESS' },
  });
  if (existingPayment) {
    throw new AppError('Payment already completed for this application', 400);
  }

  const txRef = `AAU-PAY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  const amount = application.program.registrationFee;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      applicationId,
      amount,
      currency: 'ETB',
      chapaTxRef: txRef,
      status: 'PENDING',
    },
  });

  // Initialize Chapa checkout
  const chapaPayload: Record<string, any> = {
    amount: String(Number(amount)),  // Chapa requires amount as string
    currency: 'ETB',
    email: application.user.email,
    first_name: application.user.studentProfile?.firstName || 'Student',
    last_name: application.user.studentProfile?.lastName || 'AAU',
    tx_ref: txRef,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: 'AAU Reg. Fee',
      description: `${application.program.name} registration`,
    },
  };

  // Add phone if available
  if (application.user.studentProfile?.phone) {
    chapaPayload.phone_number = application.user.studentProfile.phone;
  }

  try {
    const response = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chapaPayload),
    });

    const result: any = await response.json();

    if (result.status !== 'success') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      const chapaMsg = typeof result.message === 'string'
        ? result.message
        : JSON.stringify(result.message);
      throw new AppError(`Chapa error: ${chapaMsg}`, 400);
    }

    return {
      paymentId: payment.id,
      checkoutUrl: result.data.checkout_url,
      txRef,
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    // If Chapa is unavailable, return payment info for manual/dev testing
    return {
      paymentId: payment.id,
      checkoutUrl: null,
      txRef,
      message: 'Chapa API unavailable. Payment created in pending state.',
    };
  }
};

export const verifyPayment = async (txRef: string) => {
  const payment = await prisma.payment.findUnique({
    where: { chapaTxRef: txRef },
    include: { application: true },
  });

  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status === 'SUCCESS') return payment;

  try {
    const response = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
    });
    const result: any = await response.json();

    if (result.status === 'success' && result.data.status === 'success') {
      const updated = await prisma.$transaction(async (tx: any) => {
        const pay = await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS', paidAt: new Date() },
        });

        await tx.application.update({
          where: { id: payment.applicationId },
          data: { status: 'UNDER_REVIEW' },
        });

        await tx.applicationStatusHistory.create({
          data: {
            applicationId: payment.applicationId,
            status: 'UNDER_REVIEW',
            notes: `Payment verified. Transaction: ${txRef}`,
          },
        });

        // Only create notification if application has an institutionId
        if (payment.application.institutionId) {
          await tx.notification.create({
            data: {
              userId: payment.application.userId,
              institutionId: payment.application.institutionId,
              title: 'Payment Confirmed',
              message: `Your payment of ${payment.amount} ETB has been confirmed. Your application is now under review.`,
            },
          });
        }

        return pay;
      });

      return updated;
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new AppError('Payment verification failed', 400);
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError('Unable to verify payment at this time', 500);
  }
};

export const getPaymentsByApplication = async (applicationId: string) => {
  return prisma.payment.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });
};

export const handleWebhook = async (payload: any) => {
  const txRef = payload.tx_ref || payload.trx_ref;
  if (!txRef) throw new AppError('Invalid webhook payload', 400);

  return verifyPayment(txRef);
};

// Internal runtime track checkpoint: 2026-07-07 02:58:30
