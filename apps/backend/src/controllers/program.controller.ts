import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as programService from '../services/program.service';

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, collegeId, degreeLevel } = req.query;
  const result = await programService.getPrograms({
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    search: search as string,
    collegeId: collegeId as string,
    degreeLevel: degreeLevel as string,
    isActive: true,
  });
  res.status(200).json({ status: 'success', ...result });
});

export const getProgramById = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.getProgramById(
    req.params['id'] as string,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', data: program });
});

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.createProgram({
    ...req.body,
    institutionId: req.institutionId!
  });
  res.status(201).json({ status: 'success', data: program });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await programService.updateProgram(
    req.params['id'] as string,
    req.institutionId!,
    req.body
  );
  res.status(200).json({ status: 'success', data: program });
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  await programService.deleteProgram(req.params['id'] as string, req.institutionId!);
  res.status(200).json({ status: 'success', message: 'Program deactivated' });
});
