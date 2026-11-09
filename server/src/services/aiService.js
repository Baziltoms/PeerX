import {
  Announcement,
  Event,
  Assignment,
  Timetable,
  Attendance,
  AttendanceSession,
  StudyMaterial,
  User,
  StudentProfile,
  FacultyProfile,
} from '../models/index.js';

export const processAIQuery = async ({ user, prompt }) => {
  const queryLower = prompt.toLowerCase();
  const institutionId = user.institution;

  // 1. Gather Grounded Campus Context
  let attendanceInfo = null;
  let announcements = [];
  let assignments = [];
  let events = [];
  let todaysTimetable = [];

  if (institutionId) {
    announcements = await Announcement.find({ institution: institutionId })
      .sort({ createdAt: -1 })
      .limit(5);

    events = await Event.find({ institution: institutionId, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(5);
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = days[new Date().getDay()];

  if (user.role === 'student') {
    // Fetch student's attendance
    const attendanceRecords = await Attendance.find({ student: user._id });
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 100;
    attendanceInfo = { total, present, absent: total - present, percentage: pct };

    // Fetch assignments
    assignments = await Assignment.find({ institution: institutionId, deadline: { $gte: new Date() } })
      .populate('subject', 'name code')
      .sort({ deadline: 1 })
      .limit(5);

    // Timetable
    const profile = await StudentProfile.findOne({ user: user._id });
    if (profile?.classSection) {
      todaysTimetable = await Timetable.find({
        institution: institutionId,
        classSection: profile.classSection,
        dayOfWeek: todayDay,
      })
        .populate('subject', 'name code')
        .populate('faculty', 'name')
        .sort({ periodNumber: 1 });
    }
  } else if (user.role === 'faculty') {
    todaysTimetable = await Timetable.find({
      institution: institutionId,
      faculty: user._id,
      dayOfWeek: todayDay,
    })
      .populate('subject', 'name code')
      .populate('classSection', 'name')
      .sort({ periodNumber: 1 });
  }

  // 2. Intelligent Heuristic / Grounded Engine
  // Check intents: Attendance, Timetable, Assignments, Announcements, Events, General
  if (queryLower.includes('attendance')) {
    if (user.role === 'student' && attendanceInfo) {
      const statusText =
        attendanceInfo.percentage >= 75
          ? 'You are currently in the safe zone (≥75%). Keep it up!'
          : 'Warning: Your attendance is below the mandatory 75% threshold. Please attend upcoming lectures to avoid detention from final examinations.';
      return {
        reply: `Here is your current attendance status:\n- Total Recorded Classes: ${attendanceInfo.total}\n- Classes Present/Late: ${attendanceInfo.present}\n- Classes Absent: ${attendanceInfo.absent}\n- Overall Percentage: **${attendanceInfo.percentage}%**\n\n${statusText}`,
        groundedIn: 'Live Attendance Database',
      };
    } else {
      return {
        reply:
          'University Attendance Policy stipulates a minimum of 75% attendance across all registered theory and practical courses to be eligible for end-semester examinations.',
        groundedIn: 'University Academic Regulations',
      };
    }
  }

  if (queryLower.includes('timetable') || queryLower.includes('schedule') || queryLower.includes('classes today')) {
    if (todaysTimetable.length === 0) {
      return {
        reply: `You have no scheduled classes for today (${todayDay}). Check the Academics section for the full weekly schedule.`,
        groundedIn: 'College Timetable System',
      };
    }

    const scheduleList = todaysTimetable
      .map(
        (t) =>
          `• **Period ${t.periodNumber} (${t.startTime} - ${t.endTime})**: ${t.subject?.name} (${t.subject?.code}) - Room: ${t.roomNumber}`
      )
      .join('\n');

    return {
      reply: `Here is your timetable for today (${todayDay}):\n\n${scheduleList}`,
      groundedIn: 'College Timetable System',
    };
  }

  if (queryLower.includes('assignment') || queryLower.includes('submission') || queryLower.includes('deadline')) {
    if (assignments.length === 0) {
      return {
        reply: 'You currently have no pending assignment deadlines approaching. Excellent job keeping up with submissions!',
        groundedIn: 'Academic Submissions Database',
      };
    }

    const assignmentList = assignments
      .map(
        (a) =>
          `• **${a.title}** (${a.subject?.name}) - Due: ${new Date(a.deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`
      )
      .join('\n');

    return {
      reply: `Here are your upcoming assignment deadlines:\n\n${assignmentList}\n\nPlease submit your solutions via the Academics -> Assignments tab before the respective deadlines.`,
      groundedIn: 'Coursework Database',
    };
  }

  if (queryLower.includes('announcement') || queryLower.includes('circular') || queryLower.includes('notice')) {
    if (announcements.length === 0) {
      return {
        reply: 'There are no recent campus announcements at this time.',
        groundedIn: 'Campus Circulars Archive',
      };
    }

    const noticeList = announcements
      .map((a) => `• [${a.priority.toUpperCase()}] **${a.title}**: ${a.content.substring(0, 120)}...`)
      .join('\n\n');

    return {
      reply: `Latest campus announcements:\n\n${noticeList}`,
      groundedIn: 'College Announcement Feed',
    };
  }

  if (queryLower.includes('event') || queryLower.includes('workshop') || queryLower.includes('hackathon')) {
    if (events.length === 0) {
      return {
        reply: 'No upcoming campus events or workshops are currently scheduled.',
        groundedIn: 'Campus Events Calendar',
      };
    }

    const eventList = events
      .map(
        (e) =>
          `• **${e.title}** (${e.category}) - Date: ${new Date(e.startDate).toLocaleDateString()} at ${e.venue}`
      )
      .join('\n');

    return {
      reply: `Upcoming college events and activities:\n\n${eventList}`,
      groundedIn: 'Campus Events Calendar',
    };
  }

  // General Fallback
  return {
    reply: `Hello ${user.name}! I am your PeerX College Assistant. I can provide real-time information grounded in our campus records, including:\n\n1. **Attendance check**: "What is my current attendance percentage?"\n2. **Daily schedule**: "What classes do I have today?"\n3. **Deadlines**: "Show my pending assignments and due dates"\n4. **Notices & Events**: "What are the latest announcements or upcoming college events?"\n5. **Skill Exchange**: "How does peer skill mentoring work?"\n\nHow can I help you right now?`,
    groundedIn: 'PeerX Campus Knowledge Base',
  };
};
