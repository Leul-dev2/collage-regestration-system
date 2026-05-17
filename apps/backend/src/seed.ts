import { prisma } from './config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Institution
  let institution = await prisma.institution.findUnique({ where: { slug: 'aau' } });
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: 'Addis Ababa University',
        slug: 'aau',
        primaryColor: '#1e40af',
        contactEmail: 'admissions@aau.edu.et',
      },
    });
  }

  console.log(`✅ Institution: ${institution.name}`);

  const adminPassword = await bcrypt.hash('Admin@123456', 12);

  // 2. Create Users
  const usersToSeed = [
    { email: 'superadmin@saas.com', role: 'SUPER_ADMIN', institutionId: null },
    { email: 'admin@aau.edu.et', role: 'INSTITUTION_ADMIN', institutionId: institution.id },
    { email: 'admissions@aau.edu.et', role: 'ADMISSION_OFFICER', institutionId: institution.id },
    { email: 'finance@aau.edu.et', role: 'FINANCE_OFFICER', institutionId: institution.id },
  ];

  for (const u of usersToSeed) {
    const existingUser = await prisma.user.findFirst({
      where: { email: u.email, institutionId: u.institutionId }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: u.email,
          passwordHash: adminPassword,
          role: u.role as any,
          institutionId: u.institutionId,
          isVerified: true,
        },
      });
    }
  }

  console.log('✅ Admin users seeded');

  // 3. Create Colleges
  const collegeData = [
    { name: 'College of Natural and Computational Sciences', code: 'CNCS', location: 'Addis Ababa - 4 Kilo Campus' },
    { name: 'Addis Ababa Institute of Technology', code: 'AAIT', location: 'Addis Ababa - 5 Kilo Campus' },
    { name: 'College of Business and Economics', code: 'CBE', location: 'Addis Ababa - Sidist Kilo Campus' },
    { name: 'College of Health Sciences', code: 'CHS', location: 'Addis Ababa - Tikur Anbessa Campus' },
  ];

  const colleges = [];
  for (const data of collegeData) {
    let college = await prisma.college.findFirst({
      where: { code: data.code, institutionId: institution.id }
    });

    if (!college) {
      college = await prisma.college.create({
        data: {
          ...data,
          institutionId: institution.id,
          isActive: true,
        },
      });
    }
    colleges.push(college);
  }

  console.log(`✅ ${colleges.length} colleges seeded`);

  // 4. Create Programs
  const programsData = [
    { collegeCode: 'CNCS', name: 'Computer Science', code: 'CS-BSC', degreeLevel: 'Bachelor', durationYears: 4, registrationFee: 500, tuitionFee: 12000 },
    { collegeCode: 'AAIT', name: 'Software Engineering', code: 'SE-BSC', degreeLevel: 'Bachelor', durationYears: 5, registrationFee: 600, tuitionFee: 15000 },
    { collegeCode: 'CBE', name: 'Accounting and Finance', code: 'AF-BSC', degreeLevel: 'Bachelor', durationYears: 3, registrationFee: 450, tuitionFee: 10000 },
    { collegeCode: 'CHS', name: 'Medicine (MD)', code: 'MD', degreeLevel: 'Doctorate', durationYears: 6, registrationFee: 1000, tuitionFee: 30000 },
  ];

  for (const prog of programsData) {
    const college = colleges.find(c => c.code === prog.collegeCode);
    if (!college) continue;

    const existingProg = await prisma.program.findFirst({
      where: { code: prog.code, institutionId: institution.id }
    });

    if (!existingProg) {
      await prisma.program.create({
        data: {
          collegeId: college.id,
          institutionId: institution.id,
          name: prog.name,
          code: prog.code,
          degreeLevel: prog.degreeLevel,
          durationYears: prog.durationYears,
          registrationFee: prog.registrationFee,
          tuitionFee: prog.tuitionFee,
          isActive: true,
        },
      });
    }
  }

  console.log(`✅ ${programsData.length} programs seeded`);

  // 5. Create Sample Student
  const studentEmail = 'student@aau.edu.et';
  const existingStudent = await prisma.user.findFirst({
    where: { email: studentEmail, institutionId: institution.id }
  });

  if (!existingStudent) {
    const studentPassword = await bcrypt.hash('Student@123', 12);
    await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash: studentPassword,
        role: 'STUDENT',
        institutionId: institution.id,
        isVerified: true,
        studentProfile: {
          create: {
            firstName: 'Abebe',
            lastName: 'Kebede',
            phone: '+251911223344',
            gender: 'Male',
            region: 'Addis Ababa',
          },
        },
      },
    });
  }

  console.log('✅ Sample student seeded');
  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
