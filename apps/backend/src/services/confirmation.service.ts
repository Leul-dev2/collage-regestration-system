import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export const generateConfirmationPDF = async (
  applicationId: string, 
  userId: string, 
  userRole: string,
  institutionId: string
) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, institutionId },
    include: {
      program: { include: { college: true } },
      user: {
        select: {
          id: true,
          email: true,
          studentProfile: true,
        },
      },
      payments: { where: { status: 'SUCCESS' }, take: 1, orderBy: { paidAt: 'desc' } },
      statusHistory: {
        where: { status: 'APPROVED' },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
      institution: true, // Include institution for branding
    },
  });

  if (!application) throw new AppError('Application not found', 404);

  // Only the student themselves or admins can generate the confirmation
  const isAdmin = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ADMISSION_OFFICER', 'REGISTRAR'].includes(userRole);
  if (application.userId !== userId && !isAdmin) {
    throw new AppError('Not authorized', 403);
  }

  if (application.status !== 'APPROVED') {
    throw new AppError('Confirmation is only available for approved applications', 400);
  }

  const profile = application.user.studentProfile;
  const payment = application.payments[0];
  const approvalEntry = application.statusHistory[0];
  const approvalDate = approvalEntry?.createdAt ?? new Date();
  const institution = application.institution!;

  // Create PDF
  const doc = new PDFDocument({
    size: 'A4',
    margin: 60,
    info: {
      Title: `Registration Confirmation — ${application.applicationNumber}`,
      Author: `${institution.name} Online Registration System`,
    },
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  const primaryColor = institution.primaryColor || '#1e40af';

  // ─── Header ───
  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(institution.name, { align: 'center' })
    .moveDown(0.3);

  doc
    .fontSize(11)
    .font('Helvetica')
    .fillColor('#555555')
    .text('Online Student Registration System', { align: 'center' })
    .moveDown(0.5);

  // Divider
  doc
    .strokeColor(primaryColor)
    .lineWidth(2)
    .moveTo(60, doc.y)
    .lineTo(535, doc.y)
    .stroke()
    .moveDown(1);

  // ─── Title ───
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1e293b')
    .text('REGISTRATION CONFIRMATION', { align: 'center' })
    .moveDown(1.5);

  // ─── Details Table ───
  const drawRow = (label: string, value: string) => {
    const y = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#475569')
      .text(label, 60, y, { width: 180 });
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#1e293b')
      .text(value, 250, y, { width: 285 });
    doc.moveDown(0.8);
  };

  drawRow('Application ID:', application.applicationNumber ?? application.id);
  drawRow('Student Full Name:', `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`);
  drawRow('Email:', application.user.email);
  if (profile?.phone) drawRow('Phone:', profile.phone);
  if (profile?.dateOfBirth) drawRow('Date of Birth:', new Date(profile.dateOfBirth).toLocaleDateString());
  if (profile?.previousEducation) drawRow('Previous Education:', profile.previousEducation.charAt(0).toUpperCase() + profile.previousEducation.slice(1));

  doc.moveDown(0.5);

  // Divider line
  doc
    .strokeColor('#e2e8f0')
    .lineWidth(0.5)
    .moveTo(60, doc.y)
    .lineTo(535, doc.y)
    .stroke()
    .moveDown(1);

  drawRow('College:', application.program.college.name);
  drawRow('Program:', application.program.name);
  drawRow('Degree Level:', application.program.degreeLevel);
  drawRow('Duration:', `${application.program.durationYears} year(s)`);
  drawRow('Registration Fee:', `${Number(application.program.registrationFee).toLocaleString()} ETB`);

  doc.moveDown(0.5);

  doc
    .strokeColor('#e2e8f0')
    .lineWidth(0.5)
    .moveTo(60, doc.y)
    .lineTo(535, doc.y)
    .stroke()
    .moveDown(1);

  drawRow('Application Status:', 'APPROVED ✓');
  drawRow('Approval Date:', new Date(approvalDate).toLocaleDateString());
  if (payment) {
    drawRow('Payment Confirmation No:', payment.chapaTxRef);
    drawRow('Amount Paid:', `${Number(payment.amount).toLocaleString()} ETB`);
    if (payment.paidAt) drawRow('Payment Date:', new Date(payment.paidAt).toLocaleDateString());
  }

  // ─── Stamp/Seal Area ───
  doc.moveDown(2);
  doc
    .strokeColor(primaryColor)
    .lineWidth(1.5)
    .roundedRect(350, doc.y, 180, 65, 8)
    .stroke();

  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('ELECTRONICALLY APPROVED', 360, doc.y + 10, { width: 160, align: 'center' });
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#64748b')
    .text(`${institution.slug.toUpperCase()} Admission Office`, 360, doc.y + 3, { width: 160, align: 'center' })
    .text(new Date(approvalDate).toLocaleDateString(), 360, doc.y + 3, { width: 160, align: 'center' });

  // ─── Footer ───
  doc.moveDown(4);
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#94a3b8')
    .text(
      `This document is electronically generated by the ${institution.name} Online Student Registration System and is valid without a physical signature.`,
      60,
      doc.y,
      { align: 'center', width: 475 }
    )
    .moveDown(0.5)
    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center', width: 475 });

  doc.end();

  return stream;
};
