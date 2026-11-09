import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import {
  User,
  Institution,
  Department,
  Subject,
  ClassSection,
  Timetable,
  StudentProfile,
  FacultyProfile,
  CompanyProfile,
  AttendanceSession,
  Attendance,
  StudyMaterial,
  Assignment,
  Submission,
  Announcement,
  Event,
  Notification,
  Complaint,
  Exam,
  Mark,
  SkillExchange,
  SkillModule,
  SkillLesson,
  SkillEnrollment,
  LessonProgress,
  SkillEvaluation,
  SkillFeedback,
  TutorRank,
  Achievement,
  Opportunity,
  CandidateShortlist,
} from '../models/index.js';

export const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await mongoose.connection.dropDatabase();

    const defaultPasswordHash = await User.hashPassword('1234567890');
    const companyPasswordHash = await User.hashPassword('Company@123');

    // =========================================================================
    // 1. INSTITUTIONS (COLLEGES)
    // =========================================================================
    console.log('[Seed] Creating Institutions: 1. SNGCE, 2. SCMS...');

    const sngce = await Institution.create({
      name: 'SNGCE',
      code: 'SNGCE',
      universityCollegeId: 'SNGCE-UNIV-2026',
      website: 'https://www.sngce.ac.in',
      phone: '+91 484 259 7800',
      email: 'sngce@gmail.com',
      address: {
        street: 'Kolenchery, Kadayiruppu P.O.',
        city: 'Ernakulam',
        state: 'Kerala',
        pincode: '682311',
        country: 'India',
      },
      verificationStatus: 'verified',
    });

    const scms = await Institution.create({
      name: 'SCMS',
      code: 'SCMS',
      universityCollegeId: 'SCMS-UNIV-2026',
      website: 'https://www.scmsgroup.org',
      phone: '+91 484 262 3803',
      email: 'scms@gmail.com',
      address: {
        street: 'Prathap Nagar, Muttom, Aluva',
        city: 'Cochin',
        state: 'Kerala',
        pincode: '683106',
        country: 'India',
      },
      verificationStatus: 'verified',
    });

    // College Admins
    const sngceAdmin = await User.create({
      name: 'SNGCE Admin',
      email: 'sngce@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      institution: sngce._id,
      phone: '+91 98460 11223',
    });
    sngce.adminUser = sngceAdmin._id;
    await sngce.save();

    const scmsAdmin = await User.create({
      name: 'SCMS Admin',
      email: 'scms@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      institution: scms._id,
      phone: '+91 98470 22334',
    });
    scms.adminUser = scmsAdmin._id;
    await scms.save();

    // =========================================================================
    // 2. SNGCE DEPARTMENTS & FACULTIES
    // =========================================================================
    console.log('[Seed] Creating SNGCE Departments (MCA & MBA) and Faculty Profiles...');

    // MCA Department
    const mcaDept = await Department.create({
      institution: sngce._id,
      name: 'Department of Computer Applications',
      code: 'MCA',
      hodName: 'Dr. Sandhya R',
      description: 'Center of excellence for postgraduate computing, systems engineering, AI, and cloud architectures.',
    });

    // MBA Department
    const mbaDept = await Department.create({
      institution: sngce._id,
      name: 'Department of Management Studies',
      code: 'MBA',
      hodName: 'Dr. M. K. Sanu',
      description: 'Department of Business Administration focused on strategic management, finance, marketing, and leadership.',
    });

    // SNGCE MCA Classes: Sem 2 and Sem 3
    const mcaSem2Class = await ClassSection.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'MCA Sem 2',
      semester: 2,
      academicYear: '2025-2026',
      roomNumber: 'Lab Block 204',
    });

    const mcaSem3Class = await ClassSection.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'MCA Sem 3',
      semester: 3,
      academicYear: '2025-2026',
      roomNumber: 'Lab Block 302',
    });

    // SNGCE MBA Class: Sem 1
    const mbaSem1Class = await ClassSection.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'MBA Sem 1',
      semester: 1,
      academicYear: '2025-2026',
      roomNumber: 'MBA Block 101',
    });

    // SNGCE MCA Faculties
    // 1. Dr. Sandhya R (HOD, Cyber Forensic)
    const facSandhyaR = await User.create({
      name: 'Dr. Sandhya R',
      email: 'sandhya@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isHod: true,
      institution: sngce._id,
      phone: '+91 94471 00001',
    });
    mcaDept.hodUser = facSandhyaR._id;
    await mcaDept.save();

    // 2. Sandhya C (Faculty Advisor Sem 2, Advanced Computer Networks)
    const facSandhyaC = await User.create({
      name: 'Sandhya C',
      email: 'sandhyac@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isFa: true,
      institution: sngce._id,
      phone: '+91 94471 00002',
    });
    mcaSem2Class.facultyAdvisor = facSandhyaC._id;
    await mcaSem2Class.save();

    // 3. Jisha Abraham (Faculty Advisor Sem 3, DAA, Net & Sys Admin Lab, Mini Project, Placement)
    const facJisha = await User.create({
      name: 'Jisha Abraham',
      email: 'jisha@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isFa: true,
      institution: sngce._id,
      phone: '+91 94471 00003',
    });
    mcaSem3Class.facultyAdvisor = facJisha._id;
    await mcaSem3Class.save();

    // 4. Dr. Anoopkumar M (Virtualisation & Containers, Social Network Analysis)
    const facAnoopkumar = await User.create({
      name: 'Dr. Anoopkumar M',
      email: 'anoopkumar@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94471 00004',
    });

    // 5. Dr. Alby S (Artificial Intelligence, Domain Expertise Workshops)
    const facAlby = await User.create({
      name: 'Dr. Alby S',
      email: 'alby@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94471 00005',
    });

    // 6. Smitha K S (Advanced DBMS Lab, Data Science Lab)
    const facSmitha = await User.create({
      name: 'Smitha K S',
      email: 'smitha@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94471 00006',
    });

    // 7. Rohini Raju (Advanced DBMS, Object Oriented Programming Lab)
    const facRohini = await User.create({
      name: 'Rohini Raju',
      email: 'rohini@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94471 00007',
    });

    // 8. Rubitha Chand (Data Science and Machine Learning, Mobile App Dev Lab)
    const facRubitha = await User.create({
      name: 'Rubitha Chand',
      email: 'rubitha@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94471 00008',
    });

    // =========================================================================
    // 3. SNGCE MCA SUBJECTS
    // =========================================================================
    console.log('[Seed] Creating SNGCE MCA Subjects...');

    // Sem 2 Subjects
    const subAdBMS = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'ADVANCED DATABASE MANAGEMENT SYSTEMS',
      code: '20MCA102',
      semester: 2,
      credits: 4,
      type: 'Theory',
    });

    const subAdvNet = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'ADVANCED COMPUTER NETWORKS',
      code: '20MCA104',
      semester: 2,
      credits: 4,
      type: 'Theory',
    });

    const subVirt = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'VIRTUALISATION AND CONTAINERS',
      code: '20MCA106',
      semester: 2,
      credits: 4,
      type: 'Theory',
    });

    const subAI = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'ARTIFICIAL INTELLIGENCE',
      code: '20MCA108',
      semester: 2,
      credits: 4,
      type: 'Theory',
    });

    const subAdvBMSLab = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'ADVANCED DBMS LAB',
      code: '20MCA132',
      semester: 2,
      credits: 2,
      type: 'Practical',
    });

    const subNetLab = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'NETWORKING AND SYSTEM ADMINISTRATION LAB',
      code: '20MCA134',
      semester: 2,
      credits: 2,
      type: 'Practical',
    });

    const subOopLab = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'OBJECT ORIENTED PROGRAMMING LAB',
      code: '20MCA136',
      semester: 2,
      credits: 2,
      type: 'Practical',
    });

    // Sem 3 Subjects
    const subDSML = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'DATA SCIENCE & MACHINE LEARNING',
      code: '20MCA201',
      semester: 3,
      credits: 4,
      type: 'Theory',
    });

    const subDAA = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'DESIGN & ANALYSIS OF ALGORITHMS',
      code: '20MCA203',
      semester: 3,
      credits: 4,
      type: 'Theory',
    });

    const subSNA = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'SOCIAL NETWORK ANALYSIS',
      code: '20MCA205',
      semester: 3,
      credits: 4,
      type: 'Theory',
    });

    const subCyberForensics = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'CYBER FORENSICS',
      code: '20MCA207',
      semester: 3,
      credits: 4,
      type: 'Theory',
    });

    const subMadLab = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'MOBILE APPLICATION DEVELOPMENT LAB',
      code: '20MCA231',
      semester: 3,
      credits: 2,
      type: 'Practical',
    });

    const subDsLab = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'DATA SCIENCE LAB',
      code: '20MCA233',
      semester: 3,
      credits: 2,
      type: 'Practical',
    });

    const subMiniProject = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'MINI PROJECT',
      code: '20MCA235',
      semester: 3,
      credits: 2,
      type: 'Project',
    });

    const subDomainWs = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'Domain Expertise Workshops',
      code: '20MCANC3',
      semester: 3,
      credits: 1,
      type: 'Seminar',
    });

    const subPlacement = await Subject.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'PLACEMENT TRAINING',
      code: 'PLTMCA',
      semester: 3,
      credits: 1,
      type: 'Seminar',
    });

    // Build Faculty Profiles for SNGCE MCA
    await FacultyProfile.create({
      user: facSandhyaR._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA01',
      designation: 'Professor & HOD',
      isHod: true,
      qualification: 'Ph.D. in Computer Science',
      experienceYears: 16,
      assignedSubjects: [subCyberForensics._id],
      assignedClasses: [mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 101',
    });

    await FacultyProfile.create({
      user: facSandhyaC._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA02',
      designation: 'Assistant Professor & FA',
      isFa: true,
      advisorClasses: [mcaSem2Class._id],
      qualification: 'M.Tech, Ph.D. Scholar',
      experienceYears: 9,
      assignedSubjects: [subAdvNet._id],
      assignedClasses: [mcaSem2Class._id],
      cabinNumber: 'Faculty Block Room 102',
    });

    await FacultyProfile.create({
      user: facJisha._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA03',
      designation: 'Assistant Professor & FA',
      isFa: true,
      advisorClasses: [mcaSem3Class._id],
      qualification: 'M.Tech in Computer Applications',
      experienceYears: 11,
      assignedSubjects: [subDAA._id, subNetLab._id, subMiniProject._id, subPlacement._id],
      assignedClasses: [mcaSem2Class._id, mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 103',
    });

    await FacultyProfile.create({
      user: facAnoopkumar._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA04',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Computer Science',
      experienceYears: 13,
      assignedSubjects: [subVirt._id, subSNA._id],
      assignedClasses: [mcaSem2Class._id, mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 104',
    });

    await FacultyProfile.create({
      user: facAlby._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA05',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Artificial Intelligence',
      experienceYears: 12,
      assignedSubjects: [subAI._id, subDomainWs._id],
      assignedClasses: [mcaSem2Class._id, mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 105',
    });

    await FacultyProfile.create({
      user: facSmitha._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA06',
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Computer Science',
      experienceYears: 8,
      assignedSubjects: [subAdvBMSLab._id, subDsLab._id],
      assignedClasses: [mcaSem2Class._id, mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 106',
    });

    await FacultyProfile.create({
      user: facRohini._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA07',
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Software Engineering',
      experienceYears: 7,
      assignedSubjects: [subAdBMS._id, subOopLab._id],
      assignedClasses: [mcaSem2Class._id],
      cabinNumber: 'Faculty Block Room 107',
    });

    await FacultyProfile.create({
      user: facRubitha._id,
      institution: sngce._id,
      department: mcaDept._id,
      employeeId: 'SNGCE-FAC-MCA08',
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Data Science & Engineering',
      experienceYears: 8,
      assignedSubjects: [subDSML._id, subMadLab._id],
      assignedClasses: [mcaSem3Class._id],
      cabinNumber: 'Faculty Block Room 108',
    });

    // =========================================================================
    // 4. SNGCE MBA FACULTIES & SUBJECTS
    // =========================================================================
    console.log('[Seed] Creating SNGCE MBA Faculties & Subjects...');

    const subPOM = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Principles of Management',
      code: '20MBA101',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subFA = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Financial Accounting',
      code: '20MBA103',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subME = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Managerial Economics',
      code: '20MBA105',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subMM = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Marketing Management',
      code: '20MBA107',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subHRM = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Human Resource Management',
      code: '20MBA109',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subBC = await Subject.create({
      institution: sngce._id,
      department: mbaDept._id,
      name: 'Business Communication',
      code: '20MBA111',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    // MBA Faculties:
    const facJayakrishnan = await User.create({
      name: 'Dr. A. P. Jayakrishnan',
      email: 'jayakrishnan@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94472 00001',
    });
    await FacultyProfile.create({
      user: facJayakrishnan._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA01',
      designation: 'Professor',
      qualification: 'Ph.D. in Management Studies',
      experienceYears: 18,
      assignedSubjects: [subPOM._id],
      assignedClasses: [mbaSem1Class._id],
    });

    const facSanu = await User.create({
      name: 'Dr. M. K. Sanu',
      email: 'sanu@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isHod: true,
      institution: sngce._id,
      phone: '+91 94472 00002',
    });
    mbaDept.hodUser = facSanu._id;
    await mbaDept.save();
    await FacultyProfile.create({
      user: facSanu._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA02',
      designation: 'Professor & HOD',
      isHod: true,
      qualification: 'Ph.D., M.Com, MBA',
      experienceYears: 20,
      assignedSubjects: [subFA._id],
      assignedClasses: [mbaSem1Class._id],
    });

    const facPanikkar = await User.create({
      name: 'Dr. K. N. Panikkar',
      email: 'panikkar@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94472 00003',
    });
    await FacultyProfile.create({
      user: facPanikkar._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA03',
      designation: 'Professor',
      qualification: 'Ph.D. in Applied Economics',
      experienceYears: 19,
      assignedSubjects: [subME._id],
      assignedClasses: [mbaSem1Class._id],
    });

    const facGurukkal = await User.create({
      name: 'Dr. Rajan Gurukkal',
      email: 'rajan@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isFa: true,
      institution: sngce._id,
      phone: '+91 94472 00004',
    });
    mbaSem1Class.facultyAdvisor = facGurukkal._id;
    await mbaSem1Class.save();
    await FacultyProfile.create({
      user: facGurukkal._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA04',
      designation: 'Professor & FA',
      isFa: true,
      advisorClasses: [mbaSem1Class._id],
      qualification: 'Ph.D., MBA (Marketing)',
      experienceYears: 17,
      assignedSubjects: [subMM._id],
      assignedClasses: [mbaSem1Class._id],
    });

    const facRajasekharan = await User.create({
      name: 'Dr. V. N. Rajasekharan Pillai',
      email: 'rajasekharan@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94472 00005',
    });
    await FacultyProfile.create({
      user: facRajasekharan._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA05',
      designation: 'Professor',
      qualification: 'Ph.D. in Organizational Behavior',
      experienceYears: 22,
      assignedSubjects: [subHRM._id],
      assignedClasses: [mbaSem1Class._id],
    });

    const facRadhakrishnan = await User.create({
      name: 'Dr. K. S. Radhakrishnan',
      email: 'radhakrishnan@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: sngce._id,
      phone: '+91 94472 00006',
    });
    await FacultyProfile.create({
      user: facRadhakrishnan._id,
      institution: sngce._id,
      department: mbaDept._id,
      employeeId: 'SNGCE-FAC-MBA06',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Business Communication',
      experienceYears: 14,
      assignedSubjects: [subBC._id],
      assignedClasses: [mbaSem1Class._id],
    });

    // =========================================================================
    // 5. SCMS COLLEGE: BCA DEPARTMENT, FACULTIES & SUBJECTS
    // =========================================================================
    console.log('[Seed] Creating SCMS BCA Department, Faculties & Subjects...');

    const bcaDept = await Department.create({
      institution: scms._id,
      name: 'Department of Computer Applications',
      code: 'BCA',
      hodName: 'Dr. Rajimol A',
      description: 'Undergraduate department for computer applications, foundational programming, and applied software systems.',
    });

    const bcaSem1Class = await ClassSection.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'BCA Sem 1',
      semester: 1,
      academicYear: '2025-2026',
      roomNumber: 'SCMS IT Hall 102',
    });

    // BCA Subjects
    const subProgC = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'Fundamentals of Programming Using C',
      code: 'BCA101',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subDigFund = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'Digital Fundamentals',
      code: 'BCA103',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subCLab = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'Software Lab in C',
      code: 'BCA131',
      semester: 1,
      credits: 2,
      type: 'Practical',
    });

    const subDiscMath = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'Discrete Mathematics',
      code: 'BCA105',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subCyberLaw = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'Cyber Laws and Online Safety',
      code: 'BCA107',
      semester: 1,
      credits: 4,
      type: 'Theory',
    });

    const subEnglish = await Subject.create({
      institution: scms._id,
      department: bcaDept._id,
      name: 'English',
      code: 'BCA109',
      semester: 1,
      credits: 3,
      type: 'Theory',
    });

    // BCA Faculties
    const facRajimol = await User.create({
      name: 'Dr. Rajimol A',
      email: 'rajimol@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isHod: true,
      institution: scms._id,
      phone: '+91 94473 00001',
    });
    bcaDept.hodUser = facRajimol._id;
    await bcaDept.save();
    await FacultyProfile.create({
      user: facRajimol._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA01',
      designation: 'Professor & HOD',
      isHod: true,
      qualification: 'Ph.D. in Computer Science',
      experienceYears: 15,
      assignedSubjects: [subProgC._id],
      assignedClasses: [bcaSem1Class._id],
    });

    const facAjitha = await User.create({
      name: 'Dr. Ajitha R. S.',
      email: 'ajitha@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: scms._id,
      phone: '+91 94473 00002',
    });
    await FacultyProfile.create({
      user: facAjitha._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA02',
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Electronics',
      experienceYears: 13,
      assignedSubjects: [subDigFund._id],
      assignedClasses: [bcaSem1Class._id],
    });

    const facBineesh = await User.create({
      name: 'Mr. Bineesh Jose',
      email: 'bineesh@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      isFa: true,
      institution: scms._id,
      phone: '+91 94473 00003',
    });
    bcaSem1Class.facultyAdvisor = facBineesh._id;
    await bcaSem1Class.save();
    await FacultyProfile.create({
      user: facBineesh._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA03',
      designation: 'Assistant Professor & FA',
      isFa: true,
      advisorClasses: [bcaSem1Class._id],
      qualification: 'MCA, M.Phil',
      experienceYears: 10,
      assignedSubjects: [subCLab._id],
      assignedClasses: [bcaSem1Class._id],
    });

    const facReji = await User.create({
      name: 'Dr. Reji K. Kollinal',
      email: 'reji@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: scms._id,
      phone: '+91 94473 00004',
    });
    await FacultyProfile.create({
      user: facReji._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA04',
      designation: 'Professor',
      qualification: 'Ph.D. in Mathematics',
      experienceYears: 18,
      assignedSubjects: [subDiscMath._id],
      assignedClasses: [bcaSem1Class._id],
    });

    const facSimi = await User.create({
      name: 'Ms. Simi M.',
      email: 'simi@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: scms._id,
      phone: '+91 94473 00005',
    });
    await FacultyProfile.create({
      user: facSimi._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA05',
      designation: 'Assistant Professor',
      qualification: 'LL.M., M.Tech in Cyber Security',
      experienceYears: 7,
      assignedSubjects: [subCyberLaw._id],
      assignedClasses: [bcaSem1Class._id],
    });

    const facAmbili = await User.create({
      name: 'Ms. Ambili M. S.',
      email: 'ambili@gmail.com',
      passwordHash: defaultPasswordHash,
      role: 'faculty',
      institution: scms._id,
      phone: '+91 94473 00006',
    });
    await FacultyProfile.create({
      user: facAmbili._id,
      institution: scms._id,
      department: bcaDept._id,
      employeeId: 'SCMS-FAC-BCA06',
      designation: 'Assistant Professor',
      qualification: 'M.A., M.Phil in English Literature',
      experienceYears: 9,
      assignedSubjects: [subEnglish._id],
      assignedClasses: [bcaSem1Class._id],
    });

    // =========================================================================
    // 6. STUDENTS PROVISIONING
    // =========================================================================
    console.log('[Seed] Provisioning Students for SNGCE (MCA S3, MCA S2, MBA S1) & SCMS (BCA S1)...');

    // Helper to create student and profile
    const createStudent = async ({
      name,
      email,
      rollNumber,
      institution,
      department,
      classSection,
      course,
      semester,
      batch,
      graduationYear,
      cgpa,
      percentage,
      skills = [],
      bio = '',
      github = '',
      linkedin = '',
    }) => {
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash: defaultPasswordHash,
        role: 'student',
        institution: institution._id,
        phone: '+91 98950 ' + Math.floor(10000 + Math.random() * 90000),
      });

      const profile = await StudentProfile.create({
        user: user._id,
        institution: institution._id,
        department: department._id,
        classSection: classSection._id,
        rollNumber,
        course,
        semester,
        batch,
        graduationYear,
        cgpa: cgpa || 0,
        percentage: percentage || (cgpa ? cgpa * 10 : 0),
        backlogs: 0,
        isPublicForRecruitment: true,
        skills,
        bio: bio || `${name} is an active student in ${course} at ${institution.name}.`,
        github,
        linkedin,
      });

      return { user, profile };
    };

    // A. SNGCE MCA SEM 3 STUDENTS (10 students) - with Previous Semester CGPA (Sem 1 & Sem 2 cumulative)
    const mcaSem3StudentConfigs = [
      {
        name: 'Alan Santu',
        email: 'alan@gmail.com',
        roll: 'MCA24S3-01',
        cgpa: 8.92,
        skills: [
          { name: 'React.js', level: 'advanced', verified: true },
          { name: 'Node.js', level: 'advanced', verified: true },
          { name: 'MongoDB', level: 'intermediate', verified: true },
          { name: 'Python', level: 'intermediate', verified: true },
          { name: 'Tailwind CSS', level: 'expert', verified: true },
        ],
        bio: 'MCA Sem 3 student specializing in Full-Stack Web Architecture, scalable microservices, and peer learning instruction.',
        github: 'https://github.com/alansantu',
        linkedin: 'https://linkedin.com/in/alansantu',
      },
      {
        name: 'Aveen Krishna',
        email: 'aveen@gmail.com',
        roll: 'MCA24S3-02',
        cgpa: 8.75,
        skills: [
          { name: 'Python', level: 'expert', verified: true },
          { name: 'Machine Learning', level: 'advanced', verified: true },
          { name: 'Data Science', level: 'advanced', verified: true },
          { name: 'SQL', level: 'advanced', verified: true },
        ],
        bio: 'MCA Sem 3 student passionate about statistical modeling, scikit-learn pipelines, and data analytics.',
      },
      {
        name: 'Adithya Manoj',
        email: 'adithyamanoj@gmail.com',
        roll: 'MCA24S3-03',
        cgpa: 8.40,
        skills: [
          { name: 'Java', level: 'advanced', verified: true },
          { name: 'Spring Boot', level: 'intermediate', verified: true },
          { name: 'MySQL', level: 'advanced', verified: true },
        ],
      },
      {
        name: 'Basil Thomas',
        email: 'basil@gmail.com',
        roll: 'MCA24S3-04',
        cgpa: 8.65,
        skills: [
          { name: 'Docker', level: 'advanced', verified: true },
          { name: 'Kubernetes', level: 'intermediate', verified: true },
          { name: 'Linux SysAdmin', level: 'advanced', verified: true },
        ],
      },
      {
        name: 'Basil Eldho',
        email: 'basileldho@gmail.com',
        roll: 'MCA24S3-05',
        cgpa: 8.30,
        skills: [
          { name: 'Flutter', level: 'advanced', verified: true },
          { name: 'Dart', level: 'advanced', verified: true },
          { name: 'Firebase', level: 'intermediate', verified: true },
        ],
      },
      {
        name: 'Gino Peter',
        email: 'gino@gmail.com',
        roll: 'MCA24S3-06',
        cgpa: 8.85,
        skills: [
          { name: 'Cyber Security', level: 'advanced', verified: true },
          { name: 'Network Forensics', level: 'intermediate', verified: true },
          { name: 'Ethical Hacking', level: 'advanced', verified: true },
        ],
      },
      {
        name: 'Nikitha Vinoth',
        email: 'nikitha@gmail.com',
        roll: 'MCA24S3-07',
        cgpa: 9.10,
        skills: [
          { name: 'Data Structures', level: 'expert', verified: true },
          { name: 'C++', level: 'advanced', verified: true },
          { name: 'Algorithms', level: 'expert', verified: true },
        ],
      },
      {
        name: 'Prince Kuriakose',
        email: 'prince@gmail.com',
        roll: 'MCA24S3-08',
        cgpa: 8.20,
        skills: [
          { name: 'JavaScript', level: 'intermediate', verified: true },
          { name: 'Express.js', level: 'intermediate', verified: true },
        ],
      },
      {
        name: 'Gopikrishna B',
        email: 'gopikrishna@gmail.com',
        roll: 'MCA24S3-09',
        cgpa: 8.50,
        skills: [
          { name: 'Cloud Computing', level: 'intermediate', verified: true },
          { name: 'AWS', level: 'intermediate', verified: true },
        ],
      },
      {
        name: 'Jesil C J',
        email: 'jesil@gmail.com',
        roll: 'MCA24S3-10',
        cgpa: 8.60,
        skills: [
          { name: 'Android Dev', level: 'advanced', verified: true },
          { name: 'Kotlin', level: 'intermediate', verified: true },
        ],
      },
    ];

    const mcaSem3Students = [];
    for (const c of mcaSem3StudentConfigs) {
      const res = await createStudent({
        name: c.name,
        email: c.email,
        rollNumber: c.roll,
        institution: sngce,
        department: mcaDept,
        classSection: mcaSem3Class,
        course: 'Master of Computer Applications (MCA)',
        semester: 3,
        batch: '2024-2026',
        graduationYear: 2026,
        cgpa: c.cgpa,
        skills: c.skills,
        bio: c.bio,
        github: c.github,
        linkedin: c.linkedin,
      });
      mcaSem3Students.push(res);
    }
    mcaSem3Class.students = mcaSem3Students.map((s) => s.user._id);
    await mcaSem3Class.save();

    // B. SNGCE MCA SEM 2 STUDENTS (10 students) - with Previous Semester CGPA (Sem 1)
    const mcaSem2StudentConfigs = [
      { name: 'MUZAMMIL P S', email: 'muzammil@gmail.com', roll: 'MCA24S2-01', cgpa: 8.45 },
      { name: 'NANDHU BAIJU', email: 'nandhu@gmail.com', roll: 'MCA24S2-02', cgpa: 8.60 },
      { name: 'NISTAL ROOY TJ', email: 'nistal@gmail.com', roll: 'MCA24S2-03', cgpa: 8.25 },
      { name: 'NOEL P N', email: 'noel@gmail.com', roll: 'MCA24S2-04', cgpa: 8.80 },
      { name: 'PHILOMINA SANDRIYA K S', email: 'philomina@gmail.com', roll: 'MCA24S2-05', cgpa: 9.05 },
      { name: 'SHAHAZAD T S', email: 'shahazad@gmail.com', roll: 'MCA24S2-06', cgpa: 8.35 },
      { name: 'SOUPARNIKA K S', email: 'souparnika@gmail.com', roll: 'MCA24S2-07', cgpa: 8.90 },
      { name: 'SREELAKSHMI K S', email: 'sreelakshmi@gmail.com', roll: 'MCA24S2-08', cgpa: 8.70 },
      { name: 'VAISHNAVI K M', email: 'vaishnavi@gmail.com', roll: 'MCA24S2-09', cgpa: 9.15 },
      { name: 'VAISHNAV V S', email: 'vaishnav@gmail.com', roll: 'MCA24S2-10', cgpa: 8.50 },
    ];

    const mcaSem2Students = [];
    for (const c of mcaSem2StudentConfigs) {
      const res = await createStudent({
        name: c.name,
        email: c.email,
        rollNumber: c.roll,
        institution: sngce,
        department: mcaDept,
        classSection: mcaSem2Class,
        course: 'Master of Computer Applications (MCA)',
        semester: 2,
        batch: '2024-2026',
        graduationYear: 2026,
        cgpa: c.cgpa,
        skills: [
          { name: 'Database Management', level: 'intermediate', verified: true },
          { name: 'Computer Networks', level: 'intermediate', verified: true },
          { name: 'Python', level: 'intermediate', verified: false },
        ],
      });
      mcaSem2Students.push(res);
    }
    mcaSem2Class.students = mcaSem2Students.map((s) => s.user._id);
    await mcaSem2Class.save();

    // C. SNGCE MBA SEM 1 STUDENTS (16 students) - Semester 1 (CGPA not yet generated: 0)
    const mbaStudentConfigs = [
      { name: 'ABHAY HARI', email: 'abhay@gmail.com', roll: 'MBA25-01' },
      { name: 'ABINSON BABU', email: 'abinson@gmail.com', roll: 'MBA25-02' },
      { name: 'ADITHYAN J N', email: 'adithyan@gmail.com', roll: 'MBA25-03' },
      { name: 'AFLA K A', email: 'afla@gmail.com', roll: 'MBA25-04' },
      { name: 'AKSHAY SURESH', email: 'akshay@gmail.com', roll: 'MBA25-05' },
      { name: 'ALAN ROY', email: 'alanroy@gmail.com', roll: 'MBA25-06' },
      { name: 'ALBIN ANTONY', email: 'albin@gmail.com', roll: 'MBA25-07' },
      { name: 'ANAGHA SHAJI', email: 'anagha@gmail.com', roll: 'MBA25-08' },
      { name: 'ANANTH SIVAN', email: 'ananth@gmail.com', roll: 'MBA25-09' },
      { name: 'ANU VARGHESE', email: 'anu@gmail.com', roll: 'MBA25-10' },
      { name: 'ASHWIN J', email: 'ashwin@gmail.com', roll: 'MBA25-11' },
      { name: 'ATHUL MURALI', email: 'athul@gmail.com', roll: 'MBA25-12' },
      { name: 'AYSHA AMNA', email: 'aysha@gmail.com', roll: 'MBA25-13' },
      { name: 'BALASANKAR U A', email: 'balasankar@gmail.com', roll: 'MBA25-14' },
      { name: 'BASIL MATHEW', email: 'basilmathew@gmail.com', roll: 'MBA25-15' },
      { name: 'BASIL M E', email: 'basilme@gmail.com', roll: 'MBA25-16' },
    ];

    const mbaStudents = [];
    for (const c of mbaStudentConfigs) {
      const res = await createStudent({
        name: c.name,
        email: c.email,
        rollNumber: c.roll,
        institution: sngce,
        department: mbaDept,
        classSection: mbaSem1Class,
        course: 'Master of Business Administration (MBA)',
        semester: 1,
        batch: '2025-2027',
        graduationYear: 2027,
        cgpa: 0,
        skills: [
          { name: 'Financial Analysis', level: 'beginner', verified: false },
          { name: 'Strategic Marketing', level: 'intermediate', verified: true },
        ],
      });
      mbaStudents.push(res);
    }
    mbaSem1Class.students = mbaStudents.map((s) => s.user._id);
    await mbaSem1Class.save();

    // D. SCMS BCA SEM 1 STUDENTS (10 students) - Semester 1 (CGPA: 0)
    const bcaStudentConfigs = [
      { name: 'Arjun Raj', email: 'arjun@gmail.com', roll: 'SCMS-BCA25-01' },
      { name: 'Anjali Suresh', email: 'anjali@gmail.com', roll: 'SCMS-BCA25-02' },
      { name: 'Rahul Krishnan', email: 'rahul@gmail.com', roll: 'SCMS-BCA25-03' },
      { name: 'Athira Mohan', email: 'athira@gmail.com', roll: 'SCMS-BCA25-04' },
      { name: 'Adithya Nair', email: 'adithyanair@gmail.com', roll: 'SCMS-BCA25-05' },
      { name: 'Sneha Menon', email: 'sneha@gmail.com', roll: 'SCMS-BCA25-06' },
      { name: 'Akhil Thomas', email: 'akhil@gmail.com', roll: 'SCMS-BCA25-07' },
      { name: 'Neha Varghese', email: 'neha@gmail.com', roll: 'SCMS-BCA25-08' },
      { name: 'Vishnu Prasad', email: 'vishnu@gmail.com', roll: 'SCMS-BCA25-09' },
      { name: 'Meera Joseph', email: 'meera@gmail.com', roll: 'SCMS-BCA25-10' },
    ];

    const bcaStudents = [];
    for (const c of bcaStudentConfigs) {
      const res = await createStudent({
        name: c.name,
        email: c.email,
        rollNumber: c.roll,
        institution: scms,
        department: bcaDept,
        classSection: bcaSem1Class,
        course: 'Bachelor of Computer Applications (BCA)',
        semester: 1,
        batch: '2025-2028',
        graduationYear: 2028,
        cgpa: 0,
        skills: [
          { name: 'C Programming', level: 'intermediate', verified: true },
          { name: 'Web Fundamentals', level: 'beginner', verified: false },
        ],
      });
      bcaStudents.push(res);
    }
    bcaSem1Class.students = bcaStudents.map((s) => s.user._id);
    await bcaSem1Class.save();

    // =========================================================================
    // 7. TIMETABLES ALLOCATION
    // =========================================================================
    console.log('[Seed] Setting up Timetable Allocations (exact matrix for SNGCE MCA Sem 3, plus MCA S2, MBA S1, BCA S1)...');

    // Standard Period Times
    const periodTimeSlots = {
      1: { start: '09:00 AM', end: '09:50 AM' },
      2: { start: '09:50 AM', end: '10:40 AM' },
      3: { start: '10:50 AM', end: '11:40 AM' },
      4: { start: '11:40 AM', end: '12:30 PM' },
      5: { start: '01:15 PM', end: '02:05 PM' },
      6: { start: '02:05 PM', end: '02:55 PM' },
      7: { start: '02:55 PM', end: '03:45 PM' },
      8: { start: '03:45 PM', end: '04:30 PM' },
    };

    // Helper for adding timetable entry
    const addTimetableSlot = async ({
      institution,
      department,
      classSection,
      dayOfWeek,
      periodNumber,
      subject,
      faculty,
      sessionType = 'Lecture',
      roomNumber = 'Lab Block 302',
    }) => {
      const slot = periodTimeSlots[periodNumber] || { start: '09:00 AM', end: '10:00 AM' };
      return await Timetable.create({
        institution: institution._id,
        department: department._id,
        classSection: classSection._id,
        dayOfWeek,
        periodNumber,
        startTime: slot.start,
        endTime: slot.end,
        subject: subject?._id || null,
        faculty: faculty?._id || null,
        sessionType,
        roomNumber,
        isPublished: true,
      });
    };

    // A. SNGCE MCA SEM 3 TIMETABLE (Exactly as user requested)
    // Monday
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 1, subject: subDSML, faculty: facRubitha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 2, subject: subDAA, faculty: facJisha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 3, subject: subSNA, faculty: facAnoopkumar, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 4, subject: subDAA, faculty: facJisha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 5, subject: subCyberForensics, faculty: facSandhyaR, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 6, subject: subMadLab, faculty: facRubitha, sessionType: 'Lab', roomNumber: 'Mobile App Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Monday', periodNumber: 7, subject: subMadLab, faculty: facRubitha, sessionType: 'Lab', roomNumber: 'Mobile App Lab' });

    // Tuesday
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 1, subject: subMiniProject, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Project Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 2, subject: subMiniProject, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Project Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 3, subject: subCyberForensics, faculty: facSandhyaR, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 4, subject: subDSML, faculty: facRubitha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 5, subject: subSNA, faculty: facAnoopkumar, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 6, subject: subDsLab, faculty: facSmitha, sessionType: 'Lab', roomNumber: 'Data Science Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Tuesday', periodNumber: 7, subject: subDsLab, faculty: facSmitha, sessionType: 'Lab', roomNumber: 'Data Science Lab' });

    // Wednesday
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 1, subject: subDSML, faculty: facRubitha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 2, subject: subSNA, faculty: facAnoopkumar, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 3, subject: subDSML, faculty: facRubitha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 4, subject: subDomainWs, faculty: facAlby, sessionType: 'Tutorial', roomNumber: 'Seminar Hall 1' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 5, subject: subPlacement, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Placement Cell' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 6, subject: subPlacement, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Placement Cell' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Wednesday', periodNumber: 7, subject: subPlacement, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Placement Cell' });

    // Thursday
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 1, subject: subDAA, faculty: facJisha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 2, subject: subMiniProject, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Project Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 3, subject: subDsLab, faculty: facSmitha, sessionType: 'Lab', roomNumber: 'Data Science Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 4, subject: subDsLab, faculty: facSmitha, sessionType: 'Lab', roomNumber: 'Data Science Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 5, subject: subCyberForensics, faculty: facSandhyaR, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 6, subject: subMadLab, faculty: facRubitha, sessionType: 'Lab', roomNumber: 'Mobile App Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Thursday', periodNumber: 7, subject: subMadLab, faculty: facRubitha, sessionType: 'Lab', roomNumber: 'Mobile App Lab' });

    // Friday
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 1, subject: subDAA, faculty: facJisha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 2, subject: subCyberForensics, faculty: facSandhyaR, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 3, subject: subDSML, faculty: facRubitha, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 4, subject: subSNA, faculty: facAnoopkumar, sessionType: 'Lecture' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 5, subject: subMiniProject, faculty: facJisha, sessionType: 'Tutorial', roomNumber: 'Project Lab' });
    await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem3Class, dayOfWeek: 'Friday', periodNumber: 6, subject: subDAA, faculty: facJisha, sessionType: 'Lecture' });

    // B. SNGCE MCA SEM 2 TIMETABLE
    const mca2Days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const d of mca2Days) {
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 1, subject: subAdBMS, faculty: facRohini, roomNumber: 'Lab Block 204' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 2, subject: subAdvNet, faculty: facSandhyaC, roomNumber: 'Lab Block 204' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 3, subject: subVirt, faculty: facAnoopkumar, roomNumber: 'Lab Block 204' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 4, subject: subAI, faculty: facAlby, roomNumber: 'Lab Block 204' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 5, subject: subAdvBMSLab, faculty: facSmitha, sessionType: 'Lab', roomNumber: 'Database Lab 2' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 6, subject: subNetLab, faculty: facJisha, sessionType: 'Lab', roomNumber: 'Networks Lab 1' });
      await addTimetableSlot({ institution: sngce, department: mcaDept, classSection: mcaSem2Class, dayOfWeek: d, periodNumber: 7, subject: subOopLab, faculty: facRohini, sessionType: 'Lab', roomNumber: 'OOP Lab 1' });
    }

    // C. SNGCE MBA SEM 1 TIMETABLE
    for (const d of mca2Days) {
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 1, subject: subPOM, faculty: facJayakrishnan, roomNumber: 'MBA Block 101' });
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 2, subject: subFA, faculty: facSanu, roomNumber: 'MBA Block 101' });
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 3, subject: subME, faculty: facPanikkar, roomNumber: 'MBA Block 101' });
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 4, subject: subMM, faculty: facGurukkal, roomNumber: 'MBA Block 101' });
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 5, subject: subHRM, faculty: facRajasekharan, roomNumber: 'MBA Block 101' });
      await addTimetableSlot({ institution: sngce, department: mbaDept, classSection: mbaSem1Class, dayOfWeek: d, periodNumber: 6, subject: subBC, faculty: facRadhakrishnan, roomNumber: 'MBA Block 101' });
    }

    // D. SCMS BCA SEM 1 TIMETABLE
    for (const d of mca2Days) {
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 1, subject: subProgC, faculty: facRajimol, roomNumber: 'SCMS Hall 102' });
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 2, subject: subDigFund, faculty: facAjitha, roomNumber: 'SCMS Hall 102' });
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 3, subject: subCLab, faculty: facBineesh, sessionType: 'Lab', roomNumber: 'SCMS Software Lab' });
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 4, subject: subDiscMath, faculty: facReji, roomNumber: 'SCMS Hall 102' });
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 5, subject: subCyberLaw, faculty: facSimi, roomNumber: 'SCMS Hall 102' });
      await addTimetableSlot({ institution: scms, department: bcaDept, classSection: bcaSem1Class, dayOfWeek: d, periodNumber: 6, subject: subEnglish, faculty: facAmbili, roomNumber: 'SCMS Hall 102' });
    }

    // =========================================================================
    // 8. SAMPLE HISTORICAL ATTENDANCE SESSIONS & RECORDS
    // =========================================================================
    console.log('[Seed] Recording historical attendance sessions for classes previously conducted...');

    // Generate past 10 working days
    const pastDates = [];
    let cur = new Date();
    while (pastDates.length < 8) {
      cur.setDate(cur.getDate() - 1);
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        // Monday-Friday
        const d = new Date(cur);
        d.setHours(0, 0, 0, 0);
        pastDates.push(d);
      }
    }

    // Record attendance for MCA Sem 3 on DSML, DAA, SNA, and Cyber Forensics
    const sampleMca3Subjects = [
      { sub: subDSML, fac: facRubitha, topic: 'Linear Regression & Supervised Learning Pipelines' },
      { sub: subDAA, fac: facJisha, topic: 'Asymptotic Analysis & Divide-and-Conquer Trees' },
      { sub: subSNA, fac: facAnoopkumar, topic: 'Graph Metrics, Centrality & Degree Distributions' },
      { sub: subCyberForensics, fac: facSandhyaR, topic: 'Digital Evidence Seizure & Chain of Custody Protocol' },
    ];

    for (let i = 0; i < pastDates.length; i++) {
      const d = pastDates[i];
      const targetSub = sampleMca3Subjects[i % sampleMca3Subjects.length];

      const session = await AttendanceSession.create({
        institution: sngce._id,
        faculty: targetSub.fac._id,
        subject: targetSub.sub._id,
        classSection: mcaSem3Class._id,
        periodNumber: (i % 4) + 1,
        date: d,
        totalStudents: mcaSem3Students.length,
        presentCount: 9,
        absentCount: 1,
        lateCount: 0,
        excusedCount: 0,
        topicCovered: targetSub.topic,
      });

      for (let sIdx = 0; sIdx < mcaSem3Students.length; sIdx++) {
        // Leave 1 student absent cyclically
        const isAbsent = sIdx === (i % mcaSem3Students.length);
        await Attendance.create({
          session: session._id,
          institution: sngce._id,
          subject: targetSub.sub._id,
          classSection: mcaSem3Class._id,
          student: mcaSem3Students[sIdx].user._id,
          date: d,
          periodNumber: (i % 4) + 1,
          status: isAbsent ? 'Absent' : 'Present',
        });
      }
    }

    // Also record attendance sessions for MCA Sem 2
    for (let i = 0; i < 4; i++) {
      const d = pastDates[i];
      const session = await AttendanceSession.create({
        institution: sngce._id,
        faculty: facRohini._id,
        subject: subAdBMS._id,
        classSection: mcaSem2Class._id,
        periodNumber: 1,
        date: d,
        totalStudents: mcaSem2Students.length,
        presentCount: 10,
        absentCount: 0,
        topicCovered: 'Relational Query Optimization & B+ Tree Indexes',
      });

      for (const st of mcaSem2Students) {
        await Attendance.create({
          session: session._id,
          institution: sngce._id,
          subject: subAdBMS._id,
          classSection: mcaSem2Class._id,
          student: st.user._id,
          date: d,
          periodNumber: 1,
          status: 'Present',
        });
      }
    }

    // =========================================================================
    // 9. STUDY MATERIALS, ASSIGNMENTS & EXAM RESULTS (FIRST INTERNAL MARKS)
    // =========================================================================
    console.log('[Seed] Adding Study Materials, Assignments, and First Internal Exam Results...');

    // Study Materials
    await StudyMaterial.create({
      institution: sngce._id,
      faculty: facRubitha._id,
      subject: subDSML._id,
      classSection: mcaSem3Class._id,
      title: 'Unit 1: Fundamentals of Supervised Learning & Scikit-Learn',
      description: 'Comprehensive lecture slides covering linear regression, polynomial features, regularization, and gradient descent.',
      materialType: 'PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      unitCategory: 'Unit 1',
      viewCount: 68,
    });

    await StudyMaterial.create({
      institution: sngce._id,
      faculty: facJisha._id,
      subject: subDAA._id,
      classSection: mcaSem3Class._id,
      title: 'Unit 2: Dynamic Programming, Memoization & Bellman Equation',
      description: 'Detailed analysis of DP optimal substructure, 0/1 knapsack, matrix chain multiplication, and Floyd-Warshall.',
      materialType: 'Notes',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      unitCategory: 'Unit 2',
      viewCount: 54,
    });

    await StudyMaterial.create({
      institution: sngce._id,
      faculty: facSandhyaR._id,
      subject: subCyberForensics._id,
      classSection: mcaSem3Class._id,
      title: 'Unit 1: Digital Forensics Principles & Volatile Memory Analysis',
      description: 'Reference notes on volatility framework, memory dumping tools, and legal admissibility in court.',
      materialType: 'PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      unitCategory: 'Unit 1',
      viewCount: 47,
    });

    await StudyMaterial.create({
      institution: sngce._id,
      faculty: facRohini._id,
      subject: subAdBMS._id,
      classSection: mcaSem2Class._id,
      title: 'Unit 1: Query Execution Engine & Cost-Based Optimization',
      description: 'Lecture slides on query tree transformations, join order selection, and PostgreSQL index scanning.',
      materialType: 'PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      unitCategory: 'Unit 1',
      viewCount: 42,
    });

    // Assignments
    const assignDSML = await Assignment.create({
      institution: sngce._id,
      faculty: facRubitha._id,
      subject: subDSML._id,
      classSection: mcaSem3Class._id,
      title: 'Assignment 1: Predictive Model Pipeline with Scikit-Learn',
      description: 'Implement a cross-validated classification pipeline including missing data imputation, standard scaling, and hyperparameter tuning.',
      instructions: 'Submit a clean Jupyter Notebook or GitHub repository link with markdown documentation and evaluation metrics.',
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      maxMarks: 50,
    });

    const assignDAA = await Assignment.create({
      institution: sngce._id,
      faculty: facJisha._id,
      subject: subDAA._id,
      classSection: mcaSem3Class._id,
      title: 'Assignment 1: Analysis of Shortest Path & Flow Networks',
      description: 'Implement and analyze the time complexity of Dijkstra vs Bellman-Ford algorithms on large sparse graphs.',
      instructions: 'Include empirical execution timing charts and asymptotic proofs.',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxMarks: 50,
    });

    // Sample Submission by Alan Santu
    await Submission.create({
      assignment: assignDSML._id,
      student: mcaSem3Students[0].user._id, // Alan Santu
      institution: sngce._id,
      fileUrl: 'https://github.com/alansantu/scikit-learn-pipeline-mca',
      submissionText: 'Implemented complete automated pipeline with ColumnTransformer, GridSearchCV, and ROC-AUC curve visualization.',
      status: 'graded',
      marksAwarded: 48,
      feedback: 'Excellent modular structure and comprehensive error analysis.',
      gradedBy: facRubitha._id,
      gradedAt: new Date(),
    });

    // Exams & Marks: First Internal Assessment Marks
    console.log('[Seed] Generating First Internal Assessment Examination & Marks...');
    const examMca3 = await Exam.create({
      institution: sngce._id,
      department: mcaDept._id,
      name: 'First Internal Series Examination (S3 MCA)',
      type: 'Internal Assessment 1',
      semester: 3,
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'Completed',
    });

    // Assign marks for MCA Sem 3 students across subjects
    const mca3SubjectsForExam = [
      { sub: subDSML, max: 50 },
      { sub: subDAA, max: 50 },
      { sub: subSNA, max: 50 },
      { sub: subCyberForensics, max: 50 },
      { sub: subMadLab, max: 50 },
      { sub: subDsLab, max: 50 },
    ];

    for (const studentItem of mcaSem3Students) {
      for (const item of mca3SubjectsForExam) {
        // Marks obtained between 38 and 49 based on CGPA
        const base = Math.min(49, Math.max(35, Math.round((studentItem.profile.cgpa / 10) * 50 + (Math.random() * 4 - 2))));
        const grade = base >= 45 ? 'A+' : base >= 40 ? 'A' : 'B+';
        await Mark.create({
          institution: sngce._id,
          exam: examMca3._id,
          subject: item.sub._id,
          student: studentItem.user._id,
          maxMarks: item.max,
          marksObtained: base,
          grade,
          feedback: 'Solid conceptual understanding and structured answers.',
        });
      }
    }

    // =========================================================================
    // 10. NOTIFICATIONS, OFFICIAL CIRCULARS & CAMPUS EVENTS
    // =========================================================================
    console.log('[Seed] Publishing Official College Circulars, Events & Notifications...');

    // SNGCE Announcements (Official Circulars)
    await Announcement.create({
      institution: sngce._id,
      author: sngceAdmin._id,
      title: 'KTU Odd Semester Internal Examination Marks Publication & Verification',
      content: 'The consolidated statement of marks for the First Internal Series Examination of MCA Semester 3 and Semester 2 has been published. Students are advised to verify their assessment sheets with their respective Faculty Advisors.',
      priority: 'High',
      targetAudience: ['student', 'faculty'],
      isPinned: true,
    });

    await Announcement.create({
      institution: sngce._id,
      author: sngceAdmin._id,
      title: 'MCA Mini Project Scrum Book & Milestone Review Schedule',
      content: 'All Semester 3 MCA students must submit their Sprint 1 Scrum Books and software design architecture documents to Mrs. Jisha Abraham before next Friday. External guide evaluations will be scheduled in the first week of next month.',
      priority: 'Urgent',
      targetAudience: ['student'],
      isPinned: true,
    });

    await Announcement.create({
      institution: sngce._id,
      author: sngceAdmin._id,
      title: 'Annual Technical Symposium: EQUINOX 2026',
      content: 'SNGCE MCA & Engineering departments proudly present EQUINOX 2026, featuring AI Project Exhibitions, Coding Relays, Hackathons, and Web UI Sprint Challenges.',
      priority: 'Medium',
      targetAudience: ['all'],
      isPinned: false,
    });

    // SCMS Announcements
    await Announcement.create({
      institution: scms._id,
      author: scmsAdmin._id,
      title: 'SCMS National Conference on Applied Computing & Data Analytics',
      content: 'The Department of Computer Applications invites student project presentations and research papers on AI, C Systems Programming, and Cyber Security.',
      priority: 'High',
      targetAudience: ['all'],
      isPinned: true,
    });

    // SNGCE Events
    await Event.create({
      institution: sngce._id,
      organizer: sngceAdmin._id,
      title: 'SNGCE Hackathon 2026: Campus Innovations with MERN & AI',
      description: '36-hour non-stop hackathon with live mentoring from tech leaders, prototyping cloud-native solutions.',
      category: 'Workshop',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      venue: 'SNGCE Main Computing Auditorium',
      targetAudience: ['all'],
    });

    await Event.create({
      institution: sngce._id,
      organizer: sngceAdmin._id,
      title: 'Industry Connect & Cloud Architecture Guest Lecture',
      description: 'Interactive session on Microservices, Kubernetes orchestration, and Enterprise REST API design.',
      category: 'Placement',
      startDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      venue: 'Seminar Hall 2, SNGCE Block B',
      targetAudience: ['student'],
    });

    // SCMS Events
    await Event.create({
      institution: scms._id,
      organizer: scmsAdmin._id,
      title: 'SCMS Digital Innovation & Tech Leadership Summit',
      description: 'Keynote address by corporate IT directors and alumni founders.',
      category: 'Academic',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      venue: 'SCMS Prathap Nagar Auditorium',
      targetAudience: ['all'],
    });

    // Notifications for Alan Santu
    await Notification.create({
      recipient: mcaSem3Students[0].user._id,
      institution: sngce._id,
      title: 'First Internal Exam Results Published',
      message: 'Your marks for the First Internal Series Examination are now available in the Academic Hub under Exam Results.',
      type: 'assignment',
      priority: 'high',
      link: '/student/academics?tab=results',
    });

    await Notification.create({
      recipient: mcaSem3Students[0].user._id,
      institution: sngce._id,
      title: 'Timetable Published by HOD',
      message: 'Dr. Sandhya R has published the updated weekly lecture timetable for MCA Sem 3.',
      type: 'announcement',
      priority: 'normal',
      link: '/student/academics?tab=timetable',
    });

    // Sample Complaint
    await Complaint.create({
      institution: sngce._id,
      submittedBy: mcaSem3Students[0].user._id,
      title: 'High-Performance GPU Nodes in Lab 3 Required for ML Practicals',
      description: 'During Data Science Lab sessions, deep learning model trainings take extended durations on standard dual-core machines. Requesting allocation of GPU accelerated workstation nodes.',
      category: 'Infrastructure',
      status: 'In Progress',
      assignedTo: sngceAdmin._id,
      resolutionNotes: 'IT Lab technician configured 10 dedicated Nvidia RTX nodes for MCA Lab 3.',
    });

    // =========================================================================
    // 11. PEER TO PEER SKILL EXCHANGE: COURSES, MODULES, EVALUATION QUESTIONS & ANSWERS
    // =========================================================================
    console.log('[Seed] Setting up Peer-to-Peer Skill Exchange Courses with Quizzes, Evaluations, and Q&A...');

    const alanUser = mcaSem3Students[0].user;
    const aveenUser = mcaSem3Students[1].user;
    const basilUser = mcaSem3Students[3].user;

    // Course 1: Alan Santu teaches React & Modern Web Architecture
    const reactCourse = await SkillExchange.create({
      tutor: alanUser._id,
      institution: sngce._id,
      title: 'Mastering Full-Stack React 18: Hooks, Architecture & Scalable Patterns',
      skillName: 'React.js',
      description: 'Master component architecture, custom hook composition, and high-performance state management from an experienced peer developer.',
      skillLevel: 'intermediate',
      prerequisites: ['JavaScript ES6+', 'HTML/CSS Fundamentals'],
      learningOutcomes: [
        'Build custom reusable hooks with strict contracts',
        'Implement predictable workflows using reducers and Context',
        'Profile and optimize render cycles with useMemo and useCallback',
      ],
      estimatedDuration: '3 Weeks',
      tags: ['React', 'Frontend', 'Web Development', 'JavaScript'],
      ratingAverage: 4.95,
      totalRatings: 18,
      totalEnrollments: 28,
      status: 'active',
      meetingLink: 'https://meet.jit.si/PeerX-ReactStudyGroup',
    });

    // Module 1 (Order 1 - Unlocked Initially)
    const reactMod1 = await SkillModule.create({
      skillExchange: reactCourse._id,
      orderIndex: 1,
      title: 'Module 1: Component Fundamentals & Custom Hooks',
      description: 'Deep dive into functional component lifecycles, hook rules, and custom state composition.',
      isInitialUnlocked: true,
    });

    await SkillLesson.create({
      skillExchange: reactCourse._id,
      skillModule: reactMod1._id,
      orderIndex: 1,
      title: 'Lesson 1.1: Component Architecture & Separation of Concerns',
      content: 'In this lesson, we break down monolithic components into clean presentational vs container patterns.',
      resourcePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      durationMinutes: 20,
    });

    await SkillLesson.create({
      skillExchange: reactCourse._id,
      skillModule: reactMod1._id,
      orderIndex: 2,
      title: 'Lesson 1.2: Building Production Custom Hooks',
      content: 'How to extract stateful logic into reusable hooks like useDebounce, useLocalStorage, and useFetch.',
      resourcePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=6ThXsUwLWvc',
      durationMinutes: 25,
    });

    // Module 2 (Order 2 - Locked until Module 1 is done)
    const reactMod2 = await SkillModule.create({
      skillExchange: reactCourse._id,
      orderIndex: 2,
      title: 'Module 2: Advanced State Management & Context API',
      description: 'Managing shared state across deep component trees without prop drilling.',
      isInitialUnlocked: false,
    });

    await SkillLesson.create({
      skillExchange: reactCourse._id,
      skillModule: reactMod2._id,
      orderIndex: 1,
      title: 'Lesson 2.1: Context API Architecture & Reducer Pattern',
      content: 'Combining useReducer with Context to achieve Redux-like predictable state flow.',
      resourcePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
      durationMinutes: 30,
    });

    // Module 3 (Order 3 - Locked until Midterm is passed)
    const reactMod3 = await SkillModule.create({
      skillExchange: reactCourse._id,
      orderIndex: 3,
      title: 'Module 3: Performance Tuning & Production Deployment',
      description: 'Profiling component render passes, memoization strategies, and production readiness.',
      isInitialUnlocked: false,
    });

    await SkillLesson.create({
      skillExchange: reactCourse._id,
      skillModule: reactMod3._id,
      orderIndex: 1,
      title: 'Lesson 3.1: React Profiler & Render Optimization',
      content: 'Using React Developer Tools Profiler to eliminate unnecessary re-renders with useMemo and useCallback.',
      resourcePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=DEPwA3mv_R8',
      durationMinutes: 35,
    });

    // Midterm Evaluation Quiz for React Course
    await SkillEvaluation.create({
      skillExchange: reactCourse._id,
      evaluationType: 'mid_term',
      title: 'React.js Midpoint Assessment: Fundamentals & Custom Hooks',
      passingScore: 60,
      questions: [
        {
          questionText: 'Which React hook is used to persist mutable values across renders without causing re-renders?',
          options: ['useState', 'useRef', 'useEffect', 'useReducer'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'When does the cleanup function in useEffect run?',
          options: [
            'Only once when the browser window closes',
            'Before unmounting and prior to re-executing effect on dependency update',
            'Only in development mode',
            'Synchronously during the initial render before DOM commit',
          ],
          correctOptionIndex: 1,
          points: 10,
        },
      ],
    });

    // Final Evaluation Quiz for React Course
    await SkillEvaluation.create({
      skillExchange: reactCourse._id,
      evaluationType: 'final',
      title: 'React.js Peer Mastery Final Evaluation',
      passingScore: 60,
      questions: [
        {
          questionText: 'What is the primary benefit of custom hooks in React?',
          options: [
            'Direct manipulation of browser DOM nodes',
            'Extracting and reusing stateful component logic across different components',
            'Speeding up CSS rendering speeds',
            'Enabling multi-threaded JavaScript execution',
          ],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'Why should dependency arrays in useEffect be complete and exhaustive?',
          options: [
            'To prevent infinite re-rendering and stale state closures',
            'To increase memory allocation limits',
            'To automatically compile TypeScript into WebAssembly',
            'To eliminate all network latency',
          ],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          questionText: 'What does the React.memo higher-order component do?',
          options: [
            'Persists component state to localStorage',
            'Skips re-rendering a component if its props haven’t changed',
            'Compiles JSX into binary bytecode',
            'Forces a complete garbage collection cycle',
          ],
          correctOptionIndex: 1,
          points: 10,
        },
      ],
    });

    // Tutor Rank for Alan Santu
    await TutorRank.create({
      tutor: alanUser._id,
      totalPoints: 480,
      rankTier: 'Mentor',
      totalStudentsTaught: 24,
      averageRating: 4.95,
    });

    // Course 2: Aveen Krishna teaches Python & Machine Learning
    const mlCourse = await SkillExchange.create({
      tutor: aveenUser._id,
      institution: sngce._id,
      title: 'Practical Machine Learning & Scikit-Learn Modeling',
      skillName: 'Machine Learning',
      description: 'Hands-on training in supervised learning, regression models, classification metrics, and model evaluation.',
      skillLevel: 'intermediate',
      prerequisites: ['Python 3.x basics', 'High school linear algebra'],
      learningOutcomes: [
        'Clean and preprocess real-world tabular data using pandas',
        'Build and tune classification and regression pipelines',
        'Evaluate models using Confusion Matrix, ROC-AUC, and F1-score',
      ],
      estimatedDuration: '4 Weeks',
      tags: ['Machine Learning', 'Python', 'Data Science', 'AI'],
      ratingAverage: 4.88,
      totalRatings: 12,
      totalEnrollments: 20,
      status: 'active',
      meetingLink: 'https://meet.jit.si/PeerX-MLWorkshop',
    });

    const mlMod1 = await SkillModule.create({
      skillExchange: mlCourse._id,
      orderIndex: 1,
      title: 'Module 1: Exploratory Data Analysis & Feature Engineering',
      description: 'Data wrangling with Pandas, missing value imputation, and feature scaling.',
      isInitialUnlocked: true,
    });

    await SkillLesson.create({
      skillExchange: mlCourse._id,
      skillModule: mlMod1._id,
      orderIndex: 1,
      title: 'Lesson 1.1: Pandas DataFrames & Data Cleaning Strategies',
      content: 'Learn how to detect missing values, handle categorical encodings, and perform one-hot transformations.',
      resourcePdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
      durationMinutes: 25,
    });

    await SkillEvaluation.create({
      skillExchange: mlCourse._id,
      evaluationType: 'mid_term',
      title: 'Machine Learning Foundations Midterm Quiz',
      passingScore: 60,
      questions: [
        {
          questionText: 'Which metric is most appropriate for evaluating an imbalanced classification problem?',
          options: ['Accuracy', 'F1-Score / PR-AUC', 'Mean Absolute Error', 'R-squared'],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          questionText: 'What is the purpose of regularisation techniques like L1 (Lasso) and L2 (Ridge)?',
          options: ['Speed up model training', 'Prevent model overfitting by penalising complex weights', 'Increase dataset size', 'Convert linear models to neural networks'],
          correctOptionIndex: 1,
          points: 10,
        },
      ],
    });

    // Enroll Basil Thomas into Alan Santu's React Course
    const basilEnrollment = await SkillEnrollment.create({
      learner: basilUser._id,
      skillExchange: reactCourse._id,
      tutor: alanUser._id,
      status: 'active',
      currentModuleOrder: 1,
      progressPercentage: 50,
    });

    const reactLesson1 = await SkillLesson.findOne({ skillExchange: reactCourse._id, orderIndex: 1 });
    if (reactLesson1) {
      await LessonProgress.create({
        enrollment: basilEnrollment._id,
        learner: basilUser._id,
        lesson: reactLesson1._id,
        module: reactMod1._id,
        isCompleted: true,
      });
    }

    // Pre-existing completed enrollment for Alan Santu (from peer workshop)
    const alanCompletedEnrollment = await SkillEnrollment.create({
      learner: alanUser._id,
      skillExchange: mlCourse._id,
      tutor: aveenUser._id,
      status: 'completed',
      currentModuleOrder: 1,
      progressPercentage: 100,
      finalScore: 96,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    await SkillFeedback.create({
      enrollment: alanCompletedEnrollment._id,
      skillExchange: mlCourse._id,
      learner: alanUser._id,
      tutor: aveenUser._id,
      rating: 5,
      review: 'Outstanding explanation of cross-validation pipelines and hyperparameter tuning with GridSearchCV!',
      teachingClarity: 5,
      responsiveness: 5,
    });

    await Achievement.create({
      student: alanUser._id,
      tutor: aveenUser._id,
      skillExchange: mlCourse._id,
      skillName: 'Machine Learning Pipeline Architecture',
      skillLevel: 'Advanced',
      assessedLevel: 'Advanced Mastery',
      scoreAchieved: 96,
      badgeType: 'Platinum',
      verificationCode: 'PX-ML-SNGCE-9812A',
      issuedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    // =========================================================================
    // 12. COMPANY PROFILE & CAMPUS RECRUITMENT DRIVE
    // =========================================================================
    console.log('[Seed] Setting up Recruiter Profile & Campus Placement Drive...');

    const companyUser = await User.create({
      name: 'Daniel Thomas',
      email: 'recruiter@techcorp.com',
      passwordHash: companyPasswordHash,
      role: 'company',
      phone: '+91 80 4000 8899',
    });

    const companyProfile = await CompanyProfile.create({
      user: companyUser._id,
      companyName: 'Nexus Technologies',
      registrationNumber: 'CIN-U72200KA2018PTC112345',
      industry: 'Enterprise Software & Cloud Platforms',
      website: 'https://nexustechnologies.example.com',
      location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
      verified: true,
      description: 'Leading provider of enterprise cloud infrastructure and modern web software suites.',
      contactPerson: {
        name: 'Daniel Thomas',
        designation: 'Head of University Campus Hiring',
        email: 'recruiter@techcorp.com',
        phone: '+91 80 4000 8899',
      },
      hiringDomains: ['Full-Stack Engineering', 'Cloud Infrastructure', 'Frontend React Systems'],
    });

    const opp1 = await Opportunity.create({
      company: companyUser._id,
      companyProfile: companyProfile._id,
      title: 'Associate Software Development Engineer (Full Stack)',
      description: 'Seeking high-achieving MCA graduates proficient in MERN stack, REST API design, and distributed systems.',
      type: 'Full-time',
      workMode: 'Hybrid',
      location: 'Kochi / Bengaluru',
      salaryOrStipend: '₹8,50,000 - ₹12,00,000 PA',
      minCgpa: 8.0,
      eligibleCourses: ['MCA', 'B.Tech CS'],
      graduationYear: 2026,
      requiredSkills: ['React.js', 'Node.js', 'MongoDB', 'Express.js'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      vacancies: 5,
      status: 'Active',
    });

    await CandidateShortlist.create({
      company: companyUser._id,
      student: alanUser._id,
      opportunity: opp1._id,
      status: 'Shortlisted',
      matchScore: 94,
      notes: 'Outstanding candidate with high CGPA (8.92) and verified peer achievements in React.js and MERN development.',
      statusHistory: [
        { stage: 'Matched', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Automated skill match' },
        { stage: 'Shortlisted', updatedAt: new Date(), note: 'Shortlisted for technical interviews' },
      ],
    });

    console.log('\n========================================================================');
    console.log('  PEERX MULTI-COLLEGE DATABASE SEEDING COMPLETED SUCCESSFULLY!          ');
    console.log('========================================================================');
    console.log('  COLLEGES CONFIGURED:                                                  ');
    console.log('  1. SNGCE (Sree Narayana Gurukulam College of Engineering)             ');
    console.log('     Admin Email:    sngce@gmail.com                                    ');
    console.log('     Admin Password: 1234567890                                         ');
    console.log('     Departments:    MCA (Sem 2: 10 students, Sem 3: 10 students)       ');
    console.log('                     MBA (Sem 1: 16 students)                           ');
    console.log('                                                                        ');
    console.log('  2. SCMS (SCMS School of Technology and Management)                    ');
    console.log('     Admin Email:    scms@gmail.com                                     ');
    console.log('     Admin Password: 1234567890                                         ');
    console.log('     Departments:    BCA (Sem 1: 10 students)                           ');
    console.log('                                                                        ');
    console.log('  SAMPLE USER CREDENTIALS (ALL PASSWORDS: 1234567890):                  ');
    console.log('  ----------------------------------------------------------------------');
    console.log('  • SNGCE Admin:    sngce@gmail.com                                     ');
    console.log('  • SCMS Admin:     scms@gmail.com                                      ');
    console.log('  • MCA HOD:        sandhya@gmail.com     (Dr. Sandhya R)               ');
    console.log('  • MCA S2 FA:      sandhyac@gmail.com    (Sandhya C)                   ');
    console.log('  • MCA S3 FA:      jisha@gmail.com       (Jisha Abraham)               ');
    console.log('  • MCA Faculty:    anoopkumar@gmail.com  (Dr. Anoopkumar M)            ');
    console.log('  • MCA Faculty:    rubitha@gmail.com     (Rubitha Chand)               ');
    console.log('  • MCA Faculty:    smitha@gmail.com      (Smitha K S)                  ');
    console.log('  • MCA Faculty:    rohini@gmail.com      (Rohini Raju)                 ');
    console.log('  • MCA Faculty:    alby@gmail.com        (Dr. Alby S)                  ');
    console.log('  • MBA HOD:        sanu@gmail.com        (Dr. M. K. Sanu)              ');
    console.log('  • MBA S1 FA:      rajan@gmail.com       (Dr. Rajan Gurukkal)          ');
    console.log('  • SCMS BCA HOD:   rajimol@gmail.com     (Dr. Rajimol A)               ');
    console.log('  • SCMS BCA FA:    bineesh@gmail.com     (Mr. Bineesh Jose)            ');
    console.log('  • Student SNGCE:  alan@gmail.com        (Alan Santu - MCA Sem 3)      ');
    console.log('  • Student SNGCE:  aveen@gmail.com       (Aveen Krishna - MCA Sem 3)   ');
    console.log('  • Student SNGCE:  muzammil@gmail.com    (MUZAMMIL P S - MCA Sem 2)    ');
    console.log('  • Student MBA:    abhay@gmail.com       (ABHAY HARI - MBA Sem 1)      ');
    console.log('  • Student SCMS:   arjun@gmail.com       (Arjun Raj - BCA Sem 1)       ');
    console.log('  • Recruiter:      recruiter@techcorp.com (Company@123)                ');
    console.log('========================================================================\n');
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// If run directly via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData()
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
