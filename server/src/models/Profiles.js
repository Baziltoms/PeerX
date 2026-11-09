import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate',
    },
    verified: { type: Boolean, default: false },
    endorsedByPeerCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    techStack: [String],
    link: String,
    github: String,
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: String,
    issueDate: Date,
    credentialUrl: String,
  },
  { _id: true }
);

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
    },
    course: {
      type: String,
      default: 'Master of Computer Applications (MCA)',
    },
    semester: {
      type: Number,
      default: 4,
    },
    batch: {
      type: String,
      default: '2024-2026',
    },
    graduationYear: {
      type: Number,
      default: 2026,
    },
    cgpa: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10,
    },
    percentage: {
      type: Number,
      default: 85,
    },
    backlogs: {
      type: Number,
      default: 0,
    },
    isPublicForRecruitment: {
      type: Boolean,
      default: true,
    },
    skills: [skillItemSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    bio: {
      type: String,
      default: '',
    },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    interests: [String],
  },
  { timestamps: true }
);

const facultyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      default: 'Assistant Professor',
    },
    qualification: {
      type: String,
      default: 'Ph.D. in Computer Applications',
    },
    specialization: [String],
    experienceYears: {
      type: Number,
      default: 8,
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassSection',
      },
    ],
    officeHours: {
      type: String,
      default: 'Mon - Fri: 3:00 PM - 5:00 PM',
    },
    cabinNumber: {
      type: String,
      default: 'Lab Block Room 304',
    },
    isHod: {
      type: Boolean,
      default: false,
    },
    isFa: {
      type: Boolean,
      default: false,
    },
    advisorClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassSection',
      },
    ],
  },
  { timestamps: true }
);

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Official corporate registration number is required'],
      trim: true,
      uppercase: true,
      unique: true,
    },
    industry: {
      type: String,
      default: 'Information Technology & Software',
    },
    website: {
      type: String,
      default: '',
    },
    location: {
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      country: { type: String, default: 'India' },
    },
    verified: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    contactPerson: {
      name: String,
      designation: String,
      phone: String,
      email: String,
    },
    hiringDomains: [String],
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export const FacultyProfile = mongoose.model('FacultyProfile', facultyProfileSchema);
export const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
