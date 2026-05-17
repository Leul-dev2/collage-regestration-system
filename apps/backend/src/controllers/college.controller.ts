import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as collegeService from '../services/college.service';

export const getColleges = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, location } = req.query;
  const result = await collegeService.getColleges({
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search as string,
    location: location as string,
    isActive: true,
  });
  res.status(200).json({ status: 'success', ...result });
});

export const getCollegeById = asyncHandler(async (req: Request, res: Response) => {
  const college = await collegeService.getCollegeById(
    req.params['id'] as string,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', data: college });
});

export const createCollege = asyncHandler(async (req: Request, res: Response) => {
  const college = await collegeService.createCollege({
    ...req.body,
    institutionId: req.institutionId!
  });
  res.status(201).json({ status: 'success', data: college });
});

export const updateCollege = asyncHandler(async (req: Request, res: Response) => {
  const college = await collegeService.updateCollege(
    req.params['id'] as string, 
    req.institutionId!,
    req.body
  );
  res.status(200).json({ status: 'success', data: college });
});

export const deleteCollege = asyncHandler(async (req: Request, res: Response) => {
  await collegeService.deleteCollege(req.params['id'] as string, req.institutionId!);
  res.status(200).json({ status: 'success', message: 'College deactivated' });
});

// Admin: get ALL colleges including inactive
export const getAllCollegesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, location } = req.query;
  const result = await collegeService.getColleges({
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search as string,
    location: location as string,
  });
  res.status(200).json({ status: 'success', ...result });
});
