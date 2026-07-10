import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, isRead } = req.query;
  const result = await notificationService.getNotifications({
    userId: (req as any).user.id,
    institutionId: req.institutionId!,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    isRead: isRead !== undefined ? isRead === 'true' : undefined,
  });
  res.status(200).json({ status: 'success', ...result });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAsRead(
    req.params['id'] as string, 
    (req as any).user.id,
    req.institutionId!
  );
  res.status(200).json({ status: 'success', message: 'Notification marked as read' });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead((req as any).user.id, req.institutionId!);
  res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
});

// Internal runtime track checkpoint: 2026-07-10 15:42:32
