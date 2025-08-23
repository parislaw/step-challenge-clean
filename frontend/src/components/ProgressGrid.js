import React from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';

const ProgressGrid = ({ challenge, submissions = [], compact = false, challengeStartDate = null }) => {
  // For leaderboard usage, we might not have a full challenge object
  if (!challenge && !challengeStartDate) {
    return <div>No challenge data available</div>;
  }

  const generateGridDays = () => {
    const days = [];
    const startDate = challengeStartDate ? new Date(challengeStartDate) : new Date(challenge.start_date);
    
    for (let i = 0; i < 30; i++) {
      const currentDay = addDays(startDate, i);
      days.push(currentDay);
    }
    
    return days;
  };

  const getSubmissionForDay = (targetDate) => {
    return submissions.find(submission => {
      // Handle both date formats - leaderboard uses 'date' field, dashboard uses 'created_at'
      const submissionDate = submission.date ? parseISO(submission.date) : parseISO(submission.created_at);
      return isSameDay(submissionDate, targetDate);
    });
  };

  const getCellClass = (date, submission) => {
    const today = new Date();
    const isPastDay = date < today;
    
    if (!submission) {
      if (isPastDay) {
        return 'progress-cell missed';
      } else {
        return 'progress-cell upcoming';
      }
    }

    // Handle step count and leader status from different data structures
    const stepCount = submission.step_count || 10000;
    const isLeader = submission.is_leader || submission.is_daily_leader || false;
    
    if (isLeader) {
      return 'progress-cell leader';
    } else if (stepCount >= 10000) {
      return 'progress-cell completed';
    } else {
      return 'progress-cell partial';
    }
  };

  const getCellContent = (date, submission) => {
    // In compact mode (leaderboard), show no content - purely visual
    if (compact) {
      return null;
    }

    // For non-compact mode (dashboard), keep original functionality
    const dayNumber = format(date, 'd');
    
    if (!submission) {
      return (
        <div className="cell-content">
          <div className="day-number">{dayNumber}</div>
        </div>
      );
    }

    const stepCount = submission.step_count || 0;
    const displaySteps = stepCount >= 1000 
      ? `${Math.floor(stepCount / 1000)}k` 
      : stepCount.toString();

    return (
      <div className="cell-content">
        <div className="day-number">{dayNumber}</div>
        <div className="step-count">{displaySteps}</div>
      </div>
    );
  };

  const gridDays = generateGridDays();

  return (
    <div className={`progress-grid-container ${compact ? 'compact' : ''}`}>
      <div className="progress-grid">
        {gridDays.map((date, index) => {
          const submission = getSubmissionForDay(date);
          const cellClass = getCellClass(date, submission);
          
          return (
            <div
              key={index}
              className={cellClass}
              title={`Day ${index + 1} (${format(date, 'MMM d, yyyy')}) - ${
                submission 
                  ? `${(submission.step_count || 0).toLocaleString()} steps` 
                  : 'No submission'
              }`}
            >
              {getCellContent(date, submission)}
            </div>
          );
        })}
      </div>
      
      {!compact && (
        <div className="progress-legend">
          <div className="legend-item">
            <div className="legend-color leader"></div>
            <span>Daily Leader</span>
          </div>
          <div className="legend-item">
            <div className="legend-color completed"></div>
            <span>Goal Achieved (10k+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color partial"></div>
            <span>Partial Progress</span>
          </div>
          <div className="legend-item">
            <div className="legend-color missed"></div>
            <span>Missed Day</span>
          </div>
          <div className="legend-item">
            <div className="legend-color upcoming"></div>
            <span>Upcoming</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressGrid;