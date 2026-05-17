import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as uploadService from '../services/upload.service';

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
  }

  const document = await uploadService.uploadDocument(
    req.body.applicationId,
    (req as any).user.id,
    req.file,
    req.body.documentType
  );

  res.status(201).json({ status: 'success', data: document });
});

export const getDocumentsByApplication = asyncHandler(async (req: Request, res: Response) => {
  const documents = await uploadService.getDocumentsByApplication(req.params['applicationId'] as string);
  res.status(200).json({ status: 'success', data: documents });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await uploadService.deleteDocument(req.params['id'] as string, (req as any).user.id);
  res.status(200).json({ status: 'success', message: 'Document deleted' });
});

export const verifyDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await uploadService.verifyDocument(req.params['id'] as string, req.body.verified);
  res.status(200).json({ status: 'success', data: document });
});
