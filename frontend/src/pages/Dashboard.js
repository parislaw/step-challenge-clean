import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProgressGrid from '../components/ProgressGrid';
import { challengeAPI, submissionAPI } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user's active challenges
        const challengesResponse = await challengeAPI.getAll();
        const challenges = challengesResponse.data;
        
        // Find the user's active challenge (simplified - taking first active one)
        const activeChallengeData = challenges.find(c => c.status === 'active');
        setActiveChallenge(activeChallengeData);

        if (activeChallengeData) {
          // Load user's submissions for this challenge
          const submissionsResponse = await submissionAPI.getByChallenge(activeChallengeData.id);
          setSubmissions(submissionsResponse.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="dashboard-loading">
          <h2>Loading your progress...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.firstName}!</h1>
          {activeChallenge ? (
            <p>Your 30-day challenge is in progress. Keep up the great work! 🏃‍♂️</p>
          ) : (
            <p>Ready to start your step tracking journey? Join a challenge to get started!</p>
          )}
        </div>

        {activeChallenge ? (
          <div className="challenge-section">
            <h2>{activeChallenge.title}</h2>
            <div className="challenge-info">
              <span>Goal: 10,000 steps daily</span>
              <span>Duration: 30 days</span>
            </div>
            <ProgressGrid 
              challenge={activeChallenge}
              submissions={submissions}
            />
          </div>
        ) : (
          <div className="no-challenge">
            <h2>No Active Challenge</h2>
            <p>Join a challenge to start tracking your daily steps and compete with others!</p>
            <button 
              className="primary-button"
              onClick={() => window.location.href = '/challenges'}
            >
              Browse Challenges
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;