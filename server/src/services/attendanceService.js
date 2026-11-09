import { Timetable, AttendanceSession, Attendance, ClassSection, User } from '../models/index.js';

export const verifyAndSubmitAttendance = async ({
  facultyId,
  institutionId,
  classSectionId,
  subjectId,
  periodNumber,
  date,
  attendanceRecords, // Array of { studentId, status: 'Present'|'Absent'|'Late'|'Excused', remarks }
  topicCovered = '',
}) => {
  const sessionDate = new Date(date);
  sessionDate.setHours(0, 0, 0, 0);

  // 1. Get Day of Week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[sessionDate.getDay()];

  if (dayOfWeek === 'Sunday') {
    throw new Error('Attendance cannot be recorded on Sundays.');
  }

  // 2. Strict Authorization Chain: Verify Timetable Allocation
  // faculty -> institution -> classSection -> subject -> periodNumber -> dayOfWeek
  const allocation = await Timetable.findOne({
    institution: institutionId,
    faculty: facultyId,
    classSection: classSectionId,
    subject: subjectId,
    periodNumber: Number(periodNumber),
    dayOfWeek,
  });

  if (!allocation) {
    throw new Error(
      `Unauthorized: You are not assigned to Period ${periodNumber} for this Subject & Class on ${dayOfWeek}. Attendance submission rejected.`
    );
  }

  // 3. Check for existing session on this date and period
  let session = await AttendanceSession.findOne({
    institution: institutionId,
    classSection: classSectionId,
    subject: subjectId,
    periodNumber: Number(periodNumber),
    date: sessionDate,
  });

  if (session) {
    // Check if still within editable window
    if (new Date() > new Date(session.editableUntil)) {
      throw new Error('Attendance edit window (24 hours) has expired for this session.');
    }
  } else {
    session = new AttendanceSession({
      institution: institutionId,
      faculty: facultyId,
      subject: subjectId,
      classSection: classSectionId,
      periodNumber: Number(periodNumber),
      date: sessionDate,
    });
  }

  // 4. Calculate metrics
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  for (const record of attendanceRecords) {
    if (record.status === 'Present') presentCount++;
    else if (record.status === 'Absent') absentCount++;
    else if (record.status === 'Late') lateCount++;
    else if (record.status === 'Excused') excusedCount++;

    await Attendance.findOneAndUpdate(
      {
        student: record.studentId,
        subject: subjectId,
        date: sessionDate,
        periodNumber: Number(periodNumber),
      },
      {
        session: session._id,
        institution: institutionId,
        subject: subjectId,
        classSection: classSectionId,
        student: record.studentId,
        date: sessionDate,
        periodNumber: Number(periodNumber),
        status: record.status || 'Present',
        remarks: record.remarks || '',
      },
      { upsert: true, new: true }
    );
  }

  session.totalStudents = attendanceRecords.length;
  session.presentCount = presentCount;
  session.absentCount = absentCount;
  session.lateCount = lateCount;
  session.excusedCount = excusedCount;
  session.topicCovered = topicCovered;
  session.submittedAt = new Date();

  await session.save();

  return session;
};

export const getStudentAttendanceSummary = async (studentId, institutionId) => {
  const records = await Attendance.find({ student: studentId, institution: institutionId })
    .populate('subject', 'name code')
    .sort({ date: -1 });

  const subjectMap = {};
  let totalClasses = records.length;
  let totalPresent = 0;

  records.forEach((rec) => {
    const subId = rec.subject?._id?.toString() || 'unknown';
    const subName = rec.subject?.name || 'Subject';
    const subCode = rec.subject?.code || '';

    if (!subjectMap[subId]) {
      subjectMap[subId] = {
        subjectId: subId,
        subjectName: subName,
        subjectCode: subCode,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      };
    }

    subjectMap[subId].total += 1;
    if (rec.status === 'Present') {
      subjectMap[subId].present += 1;
      totalPresent += 1;
    } else if (rec.status === 'Late') {
      subjectMap[subId].late += 1;
      subjectMap[subId].present += 1; // late counts towards attendance
      totalPresent += 1;
    } else if (rec.status === 'Absent') {
      subjectMap[subId].absent += 1;
    } else if (rec.status === 'Excused') {
      subjectMap[subId].excused += 1;
    }
  });

  const subjectSummaries = Object.values(subjectMap).map((sub) => ({
    ...sub,
    percentage: sub.total > 0 ? Math.round((sub.present / sub.total) * 100) : 0,
  }));

  const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return {
    totalClasses,
    totalPresent,
    totalAbsent: totalClasses - totalPresent,
    overallPercentage,
    subjectSummaries,
    recentRecords: records.slice(0, 20),
  };
};
