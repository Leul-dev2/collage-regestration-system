import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Map UI-friendly labels to enum values
const toDocumentType = (label: string): 'TRANSCRIPT' | 'IDENTIFICATION' | 'PHOTO' | 'OTHER' => {
  const l = label.toLowerCase();
  if (l.includes('transcript') || l.includes('grade') || l.includes('certificate') || l.includes('degree')) return 'TRANSCRIPT';
  if (l.includes('id') || l.includes('passport') || l.includes('national') || l.includes('kebele')) return 'IDENTIFICATION';
  if (l.includes('photo')) return 'PHOTO';
  return 'OTHER';
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_TYPES = [
  'application/pdf',
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    cb(new AppError('Only PDF files are allowed. Please convert your document to PDF format before uploading.', 400) as any, false);
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadDocument = async (
  applicationId: string,
  userId: string,
  file: Express.Multer.File,
  documentType: string
) => {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) throw new AppError('Application not found', 404);
  if (application.userId !== userId) throw new AppError('Not authorized', 403);
  if (!['DRAFT', 'INCOMPLETE'].includes(application.status)) {
    throw new AppError('Cannot upload documents at this stage', 400);
  }

  const document = await prisma.document.create({
    data: {
      applicationId,
      type: toDocumentType(documentType),
      documentType,
      originalName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileKey: file.filename,
      sizeBytes: file.size,
    },
  });

  return document;
};

export const getDocumentsByApplication = async (applicationId: string) => {
  return prisma.document.findMany({
    where: { applicationId },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteDocument = async (documentId: string, userId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { application: true },
  });

  if (!document) throw new AppError('Document not found', 404);
  if (document.application.userId !== userId) throw new AppError('Not authorized', 403);
  if (!['DRAFT', 'INCOMPLETE'].includes(document.application.status)) {
    throw new AppError('Cannot delete documents at this stage', 400);
  }

  // Delete file from disk
  const filePath = path.join(process.cwd(), document.fileUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.document.delete({ where: { id: documentId } });
};

export const verifyDocument = async (documentId: string, verified: boolean) => {
  return prisma.document.update({
    where: { id: documentId },
    data: { isVerified: verified },
  });
};
