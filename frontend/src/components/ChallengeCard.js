import React from 'react';
import { format, parseISO, differenceInDays, isPast, isFuture } from 'date-fns';

const ChallengeCard = ({ challenge, onJoin, joinLoading, currentUser }) => {
  const startDate = parseISO(challenge.start_date);
  const endDate = parseISO(challenge.end_date);
  const now = new Date();

  const getStatus = () => {
    if (isPast(endDate)) return 'completed';
    if (isFuture(startDate)) return 'upcoming';
    return 'active';
  };

  const getStatusInfo = () => {
    const status = getStatus();
    
    switch (status) {
      case 'upcoming':
        const daysUntilStart = differenceInDays(startDate, now);
        return {
          status: 'upcoming',
          text: daysUntilStart === 0 ? 'Starts today' : `Starts in ${daysUntilStart} ${daysUntilStart === 1 ? 'day' : 'days'}`,
          className: 'status-upcoming'
        };
      case 'active':
        const daysRemaining = differenceInDays(endDate, now);
        return {
          status: 'active',
          text: daysRemaining === 0 ? 'Last day' : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`,
          className: 'status-active'
        };
      case 'completed':
        return {
          status: 'completed',
          text: 'Challenge completed',
          className: 'status-completed'
        };
      default:
        return { status: 'unknown', text: 'Unknown', className: '' };
    }
  };

  const canJoin = () => {
    const status = getStatus();
    return !challenge.user_enrolled && (status === 'upcoming' || status === 'active');
  };

  const getJoinButtonText = () => {
    if (joinLoading) return 'Joining...';
    if (challenge.user_enrolled) return 'Enrolled';
    
    const status = getStatus();
    if (status === 'completed') return 'Completed';
    if (status === 'active') return 'Join Challenge';
    return 'Join Challenge';
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <h3 className="challenge-name">{challenge.title}</h3>
        <span className={`challenge-status ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
      </div>

      <div className="challenge-description">
        <p>{challenge.description || 'Complete 30 days of 10,000+ steps and compete for daily leadership!'}</p>
      </div>

      <div className="challenge-details">
        <div className="detail-item">
          <span className="detail-label">Duration:</span>
          <span className="detail-value">30 days</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Daily Goal:</span>
          <span className="detail-value">10,000 steps</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Start Date:</span>
          <span className="detail-value">{format(startDate, 'MMM d, yyyy')}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">End Date:</span>
          <span className="detail-value">{format(endDate, 'MMM d, yyyy')}</span>
        </div>
        {challenge.prize_amount && (
          <div className="detail-item">
            <span className="detail-label">Entry Fee:</span>
            <span className="detail-value">${challenge.prize_amount}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="detail-label">Participants:</span>
          <span className="detail-value">{challenge.participant_count || 0} joined</span>
        </div>
      </div>

      <div className="challenge-actions">
        <button
          className={`challenge-join-btn ${
            challenge.user_enrolled ? 'enrolled' :
            canJoin() ? 'primary' : 'disabled'
          }`}
          onClick={() => canJoin() && onJoin(challenge.id)}
          disabled={!canJoin() || joinLoading}
        >
          {getJoinButtonText()}
        </button>
        
        {challenge.user_enrolled && (
          <div className="enrollment-indicator">
            <span>✓ You're enrolled in this challenge</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;