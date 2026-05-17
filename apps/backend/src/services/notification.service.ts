import { prisma } from '../config/prisma';

interface NotificationQuery {
  userId: string;
  institutionId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const getNotifications = async (query: NotificationQuery) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = { 
    userId: query.userId,
    institutionId: query.institutionId
  };
  if (query.isRead !== undefined) where.isRead = query.isRead;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ 
      where: { 
        userId: query.userId, 
        institutionId: query.institutionId,
        isRead: false 
      } 
    }),
  ]);

  return {
    data: notifications,
    unreadCount,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const markAsRead = async (notificationId: string, userId: string, institutionId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId, institutionId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId: string, institutionId: string) => {
  return prisma.notification.updateMany({
    where: { userId, institutionId, isRead: false },
    data: { isRead: true },
  });
};

export const createNotification = async (data: {
  userId: string;
  institutionId: string;
  title: string;
  message: string;
}) => {
  return prisma.notification.create({ data });
};
