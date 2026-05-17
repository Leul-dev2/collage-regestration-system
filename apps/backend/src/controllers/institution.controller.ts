import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as institutionService from '../services/institution.service';

export const getCurrentInstitution = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: req.institution
  });
});

export const getAllInstitutions = asyncHandler(async (req: Request, res: Response) => {
  const institutions = await institutionService.getInstitutions();
  res.status(200).json({
    status: 'success',
    data: institutions
  });
});

export const createInstitution = asyncHandler(async (req: Request, res: Response) => {
  const institution = await institutionService.createInstitution(req.body);
  res.status(201).json({
    status: 'success',
    data: institution
  });
});

export const getInstitutionById = asyncHandler(async (req: Request, res: Response) => {
  const institution = await institutionService.getInstitutionById(req.params['id'] as string);
  res.status(200).json({
    status: 'success',
    data: institution
  });
});
