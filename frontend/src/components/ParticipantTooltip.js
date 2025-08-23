import React from 'react';

const ParticipantTooltip = ({ participant, isVisible, position }) => {
  if (!isVisible || !participant) return null;

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div 
      className="participant-tooltip"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="tooltip-header">
        <h4>{participant.first_name} {participant.last_initial}.</h4>
        <span className="tooltip-rank">#{participant.rank}</span>
      </div>
      
      <div className="tooltip-stats">
        <div className="stat-row">
          <span className="stat-label">Total Steps:</span>
          <span className="stat-value">{formatNumber(participant.total_steps)}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Avg/Day:</span>
          <span className="stat-value">{formatNumber(Math.round(participant.avg_daily_steps))}</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Goal Days:</span>
          <span className="stat-value">{participant.goal_days}/30</span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Current Streak:</span>
          <span className="stat-value">
            {participant.current_streak > 0 ? (
              <span className="streak-value">🔥{participant.current_streak}</span>
            ) : (
              '0 days'
            )}
          </span>
        </div>
        
        <div className="stat-row">
          <span className="stat-label">Completion:</span>
          <span className="stat-value completion-percentage">
            {participant.completion_percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantTooltip;