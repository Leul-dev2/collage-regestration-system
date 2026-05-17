import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as applicationService from '../services/application.service';
import * as confirmationService from '../services/confirmation.service';

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status } = req.query;
  const result = await applicationService.getApplications({
    userId: (req as any).user.id,
    institutionId: req.institutionId,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    status: status as any,
  });
  res.status(200).json({ status: 'success', ...result });
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.getApplicationById(
    req.params['id'] as string,
    req.institutionId
  );
  res.status(200).json({ status: 'success', data: application });
});

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.createApplication(
    (req as any).user.id,
    req.body.programId,
    req.institutionId!
  );
  res.status(201).json({ status: 'success', data: application });
});

export const checkDuplicate = asyncHandler(async (req: Request, res: Response) => {
  const existing = await applicationService.checkDuplicateApplication(
    (req as any).user.id,
    req.query['programId'] as string,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', data: existing });
});

export const saveDraft = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.saveDraft(
    req.params['id'] as string,
    (req as any).user.id
  );
  res.status(200).json({ status: 'success', data: application });
});

export const submitApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = await applicationService.submitApplication(
    req.params['id'] as string,
    (req as any).user.id,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', data: application });
});

// Admin endpoints
export const getAllApplications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, programId, search, startDate, endDate } = req.query;
  const result = await applicationService.getApplications({
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    status: status as any,
    programId: programId as string,
    institutionId: req.institutionId,
    search: search as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  res.status(200).json({ status: 'success', ...result });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;
  const application = await applicationService.updateApplicationStatus(
    req.params['id'] as string,
    status,
    notes,
    (req as any).user.id,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', data: application });
});

export const downloadConfirmation = asyncHandler(async (req: Request, res: Response) => {
  const stream = await confirmationService.generateConfirmationPDF(
    req.params['id'] as string,
    (req as any).user.id,
    (req as any).user.role,
    req.institutionId!
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=AAU_Confirmation_${req.params['id']}.pdf`);
  
  stream.pipe(res);
});
