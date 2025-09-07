import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import ProgressGrid from '../components/ProgressGrid';
import ParticipantTooltip from '../components/ParticipantTooltip';

const Leaderboard = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('total_steps');
  const [hoveredParticipant, setHoveredParticipant] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState('compact'); // 'compact' | 'detailed'

  // Load available challenges on component mount
  useEffect(() => {
    loadChallenges();
  }, []);

  // Load leaderboard when challenge is selected
  useEffect(() => {
    if (selectedChallengeId) {
      loadLeaderboard();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChallengeId, sortBy]);

  const loadChallenges = async () => {
    try {
      const response = await api.get('/leaderboard');
      setChallenges(response.data);
      
      // Auto-select the first active challenge, or first available
      const activeChallenge = response.data.find(c => c.status === 'active');
      const defaultChallenge = activeChallenge || response.data[0];
      
      if (defaultChallenge) {
        setSelectedChallengeId(defaultChallenge.id.toString());
      }
    } catch (err) {
      setError('Failed to load challenges');
      console.error('Error loading challenges:', err);
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedChallengeId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/leaderboard/${selectedChallengeId}?sortBy=${sortBy}`);
      setLeaderboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'Upcoming', class: 'badge-upcoming' },
      active: { text: 'Active', class: 'badge-active' },
      completed: { text: 'Completed', class: 'badge-completed' }
    };
    
    const badge = badges[status] || { text: status, class: 'badge-default' };
    
    return (
      <span className={`badge ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const isCurrentUser = (participantId) => {
    return user && user.id === participantId;
  };

  const handleParticipantHover = (participant, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width + 10,
      y: rect.top
    });
    setHoveredParticipant(participant);
  };

  const handleParticipantLeave = () => {
    setHoveredParticipant(null);
  };

  const toggleRowExpansion = (participantId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(participantId)) {
      newExpanded.delete(participantId);
    } else {
      newExpanded.add(participantId);
    }
    setExpandedRows(newExpanded);
  };

  const getDailyBreakdown = (dailySubmissions, challengeStartDate) => {
    if (!dailySubmissions || dailySubmissions.length === 0) return [];
    
    return dailySubmissions
      .sort((a, b) => new Date(a.date || a.created_at) - new Date(b.date || b.created_at))
      .slice(0, 7); // Show last 7 days for expanded view
  };

  const scrollToCurrentUser = () => {
    if (!user || !leaderboardData) return;
    
    const userIndex = leaderboardData.leaderboard.findIndex(p => p.id === user.id);
    if (userIndex >= 0) {
      const element = document.querySelector(`[data-participant-id="${user.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (challenges.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h1>Leaderboard</h1>
          <p>You need to be enrolled in at least one challenge to view leaderboards.</p>
          <p>Visit the <strong>Challenges</strong> page to join a challenge!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Leaderboard</h1>
        
        {/* Challenge Selector */}
        <div className="form-group">
          <label htmlFor="challenge-select">Select Challenge:</label>
          <select
            id="challenge-select"
            value={selectedChallengeId}
            onChange={(e) => setSelectedChallengeId(e.target.value)}
            className="form-control"
          >
            {challenges.map(challenge => (
              <option key={challenge.id} value={challenge.id}>
                {challenge.title} ({challenge.participant_count} participants) {getStatusBadge(challenge.status).props.children}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {leaderboardData && (
          <>
            {/* Challenge Info */}
            <div className="challenge-info">
              <h2>{leaderboardData.challenge.title}</h2>
              <div className="challenge-meta">
                {getStatusBadge(leaderboardData.challenge.status)}
                <span>
                  {new Date(leaderboardData.challenge.start_date).toLocaleDateString()} - 
                  {new Date(leaderboardData.challenge.end_date).toLocaleDateString()}
                </span>
                <span>{leaderboardData.challenge.total_participants} participants</span>
              </div>
            </div>

            {/* Controls Section */}
            <div className="leaderboard-controls">
              <div className="controls-left">
                <div className="sort-controls">
                  <label htmlFor="sort-select">Sort by:</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-control inline"
                  >
                    <option value="total_steps">Total Steps</option>
                    <option value="avg_daily_steps">Avg Daily Steps</option>
                    <option value="goal_days">Goal Days (≥10K)</option>
                    <option value="current_streak">Current Streak</option>
                    <option value="completion_percentage">Completion %</option>
                  </select>
                </div>
                
                <div className="view-controls">
                  <label htmlFor="view-select">View:</label>
                  <select
                    id="view-select"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="form-control inline"
                  >
                    <option value="compact">Compact</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>

              <div className="controls-right">
                {user && (
                  <button 
                    className="find-me-btn"
                    onClick={scrollToCurrentUser}
                    title="Scroll to my position"
                  >
                    📍 Find Me
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : (
              <>
                {/* Compact Top Performers Bar */}
                {leaderboardData.leaderboard.length > 0 && (
                  <div className="top-performers-bar">
                    <h3>🏆 Top Performers</h3>
                    <div className="top-performers-list">
                      {leaderboardData.leaderboard.slice(0, 3).map((participant, index) => (
                        <div 
                          key={participant.id} 
                          className={`top-performer-item position-${index + 1} ${isCurrentUser(participant.id) ? 'current-user' : ''}`}
                        >
                          <span className="top-rank">{getRankIcon(participant.rank)}</span>
                          <span className="top-name">
                            {participant.first_name} {participant.last_initial}.
                            {isCurrentUser(participant.id) && <span className="you-badge-mini">You</span>}
                          </span>
                          <span className="top-steps">{formatNumber(participant.total_steps || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard List */}
                <div className={`leaderboard-container ${viewMode}`}>
                  {viewMode === 'compact' ? (
                    /* Compact Table View */
                    <div className="compact-table">
                      <div className="table-header">
                        <div className="col-rank">Rank</div>
                        <div className="col-name">Name</div>
                        <div className="col-steps">Steps</div>
                        <div className="col-grid">30-Day Progress</div>
                        <div className="col-completion">Complete</div>
                      </div>
                      {leaderboardData.leaderboard.map((participant, index) => (
                        <div 
                          key={participant.id} 
                          className={`table-row ${isCurrentUser(participant.id) ? 'current-user' : ''}`}
                          data-participant-id={participant.id}
                        >
                          <div className="col-rank">
                            <span className="rank-number">{participant.rank}</span>
                          </div>
                          <div className="col-name">
                            <span className="participant-name-compact">
                              {participant.first_name} {participant.last_initial}.
                              {isCurrentUser(participant.id) && <span className="you-badge-mini">You</span>}
                            </span>
                          </div>
                          <div className="col-steps">
                            <span className="steps-value">{formatNumber(participant.total_steps || 0)}</span>
                          </div>
                          <div className="col-grid">
                            <ProgressGrid
                              submissions={participant.daily_submissions || []}
                              challengeStartDate={leaderboardData.challenge.start_date}
                              compact={true}
                            />
                          </div>
                          <div className="col-completion">
                            <span className="completion-value">{Math.round(participant.completion_percentage || 0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Detailed Grid View */
                    <div className="detailed-grid">
                      {leaderboardData.leaderboard.slice(3).map((participant, index) => {
                        const isExpanded = expandedRows.has(participant.id);
                        const recentDays = getDailyBreakdown(participant.daily_submissions, leaderboardData.challenge.start_date);
                        
                        return (
                          <div key={participant.id} className="participant-container">
                            <div 
                              className={`participant-row ${isCurrentUser(participant.id) ? 'current-user' : ''} ${isExpanded ? 'expanded' : ''}`}
                              data-participant-id={participant.id}
                            >
                            <div className="participant-rank">
                              <span className="rank-icon">
                                {getRankIcon(participant.rank)}
                              </span>
                            </div>
                            
                            <div className="participant-info">
                              <div 
                                className="participant-name-container"
                                onMouseEnter={(e) => handleParticipantHover(participant, e)}
                                onMouseLeave={handleParticipantLeave}
                              >
                                <div className="participant-avatar">
                                  <span className="avatar-initials">
                                    {participant.first_name[0]}{participant.last_initial}
                                  </span>
                                </div>
                                <div className="participant-details">
                                  <span className="participant-name">
                                    {participant.first_name} {participant.last_initial}.
                                    {isCurrentUser(participant.id) && (
                                      <span className="you-badge">You</span>
                                    )}
                                  </span>
                                  <div className="participant-stats">
                                    <span className="stat-item">
                                      <span className="stat-value">{formatNumber(participant.total_steps || 0)}</span>
                                      <span className="stat-label">total steps</span>
                                    </span>
                                    <span className="stat-divider">•</span>
                                    <span className="stat-item">
                                      <span className="stat-value">{Math.round(participant.completion_percentage || 0)}%</span>
                                      <span className="stat-label">complete</span>
                                    </span>
                                    <span className="stat-divider">•</span>
                                    <span className="stat-item">
                                      <span className="stat-value">{participant.current_streak || 0}</span>
                                      <span className="stat-label">streak</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="participant-progress">
                              <ProgressGrid
                                submissions={participant.daily_submissions || []}
                                challengeStartDate={leaderboardData.challenge.start_date}
                                compact={true}
                              />
                              <button 
                                className="expand-button"
                                onClick={() => toggleRowExpansion(participant.id)}
                                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                              >
                                {isExpanded ? '▲' : '▼'}
                              </button>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="participant-expanded-details">
                              <div className="expanded-content">
                                <div className="expanded-stats">
                                  <div className="expanded-stat">
                                    <span className="expanded-stat-label">Average Daily Steps</span>
                                    <span className="expanded-stat-value">
                                      {formatNumber(Math.round((participant.total_steps || 0) / 30))}
                                    </span>
                                  </div>
                                  <div className="expanded-stat">
                                    <span className="expanded-stat-label">Goal Days (≥10K)</span>
                                    <span className="expanded-stat-value">
                                      {participant.goal_days || 0}/30
                                    </span>
                                  </div>
                                  <div className="expanded-stat">
                                    <span className="expanded-stat-label">Best Day</span>
                                    <span className="expanded-stat-value">
                                      {formatNumber(
                                        Math.max(...(participant.daily_submissions || []).map(s => s.step_count || 0))
                                      )}
                                    </span>
                                  </div>
                                </div>
                                {recentDays.length > 0 && (
                                  <div className="recent-activity">
                                    <h5>Recent Activity</h5>
                                    <div className="recent-days">
                                      {recentDays.map((day, idx) => (
                                        <div key={idx} className="recent-day">
                                          <span className="recent-date">
                                            {new Date(day.date || day.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </span>
                                          <span className="recent-steps">
                                            {formatNumber(day.step_count || 0)} steps
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Participant Tooltip */}
                <ParticipantTooltip
                  participant={hoveredParticipant}
                  isVisible={!!hoveredParticipant}
                  position={tooltipPosition}
                />

                {/* Stats Summary */}
                <div className="leaderboard-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Total Steps (All Participants)</span>
                      <span className="stat-value">
                        {formatNumber(
                          leaderboardData.leaderboard.reduce((sum, p) => sum + (p.total_steps || 0), 0)
                        )}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Completion Rate</span>
                      <span className="stat-value">
                        {Math.round(
                          leaderboardData.leaderboard.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / 
                          leaderboardData.leaderboard.length
                        )}%
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Top Daily Steps</span>
                      <span className="stat-value">
                        {formatNumber(
                          Math.max(
                            ...leaderboardData.leaderboard.map(p => 
                              Math.max(...(p.daily_submissions || []).map(s => s.step_count || 0))
                            )
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="legend">
                  <h4>Progress Grid Legend:</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <div className="legend-color blue"></div>
                      <span>Daily Leader</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color green"></div>
                      <span>≥10,000 steps</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color orange"></div>
                      <span>&lt;10,000 steps</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color gray"></div>
                      <span>No submission</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;