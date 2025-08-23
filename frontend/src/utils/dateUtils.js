import { format, isToday, parseISO, differenceInDays, addDays } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

export const isDateToday = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
};

export const getDayNumber = (challengeStartDate, targetDate) => {
  const start = typeof challengeStartDate === 'string' ? parseISO(challengeStartDate) : challengeStartDate;
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  
  const dayDiff = differenceInDays(target, start) + 1; // +1 because day 1 is the start date
  return dayDiff;
};

export const generate30DayGrid = (challengeStartDate, submissions = []) => {
  const startDate = typeof challengeStartDate === 'string' ? parseISO(challengeStartDate) : challengeStartDate;
  const grid = [];
  
  // Create a map of submissions by date for quick lookup
  const submissionMap = {};
  submissions.forEach(sub => {
    submissionMap[sub.date] = sub;
  });
  
  for (let i = 0; i < 30; i++) {
    const currentDate = addDays(startDate, i);
    const dateString = format(currentDate, 'yyyy-MM-dd');
    const submission = submissionMap[dateString];
    
    grid.push({
      day: i + 1,
      date: currentDate,
      dateString,
      stepCount: submission?.step_count || 0,
      hasSubmission: !!submission,
      isToday: isDateToday(currentDate),
      status: getStepStatus(submission?.step_count)
    });
  }
  
  return grid;
};

export const getStepStatus = (stepCount) => {
  if (!stepCount || stepCount === 0) return 'none';
  if (stepCount >= 10000) return 'success'; // Green
  return 'partial'; // Orange
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'success': return '#28a745'; // Green
    case 'partial': return '#fd7e14'; // Orange  
    case 'leader': return '#007bff'; // Blue (for future daily leader feature)
    case 'none':
    default: return '#e9ecef'; // Gray
  }
};

export const calculateStreak = (submissions) => {
  if (!submissions || submissions.length === 0) return 0;
  
  // Sort submissions by date descending (most recent first)
  const sorted = [...submissions]
    .filter(sub => sub.step_count >= 10000) // Only count days with 10k+ steps
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (sorted.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check if today has a submission
  const todayString = format(currentDate, 'yyyy-MM-dd');
  const hasToday = sorted.some(sub => sub.date === todayString);
  
  if (!hasToday) {
    // If no submission today, check yesterday
    const yesterday = addDays(currentDate, -1);
    const yesterdayString = format(yesterday, 'yyyy-MM-dd');
    const hasYesterday = sorted.some(sub => sub.date === yesterdayString);
    
    if (!hasYesterday) return 0; // Streak is broken
    
    currentDate = yesterday; // Start counting from yesterday
  }
  
  // Count consecutive days backwards
  for (const submission of sorted) {
    const submissionDate = format(currentDate, 'yyyy-MM-dd');
    
    if (submission.date === submissionDate) {
      streak++;
      currentDate = addDays(currentDate, -1);
    } else {
      break; // Streak is broken
    }
  }
  
  return streak;
};