import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ChallengeCard from '../components/ChallengeCard';
import { challengeAPI } from '../utils/api';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [joinLoading, setJoinLoading] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const response = await challengeAPI.getAll();
        setChallenges(response.data);
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId) => {
    setJoinLoading(challengeId);
    try {
      await challengeAPI.join(challengeId);
      
      // Update the challenge in state to reflect user has joined
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, user_enrolled: true }
            : challenge
        )
      );
      
      // Navigate to dashboard to see progress
      navigate('/dashboard');
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert('Failed to join challenge. Please try again.');
    } finally {
      setJoinLoading(null);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === 'all') return true;
    if (filter === 'available') return !challenge.user_enrolled && challenge.status !== 'completed';
    if (filter === 'joined') return challenge.user_enrolled;
    return challenge.status === filter;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="challenges-loading">
          <h2>Loading challenges...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="challenges-page">
        <div className="challenges-header">
          <h1>Step Challenges</h1>
          <p>Join a 30-day challenge and compete with others to reach 10,000 steps daily!</p>
        </div>

        <div className="challenges-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Challenges
          </button>
          <button 
            className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
            onClick={() => setFilter('available')}
          >
            Available
          </button>
          <button 
            className={`filter-btn ${filter === 'joined' ? 'active' : ''}`}
            onClick={() => setFilter('joined')}
          >
            My Challenges
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
        </div>

        <div className="challenges-grid">
          {filteredChallenges.length === 0 ? (
            <div className="no-challenges">
              <h3>No challenges found</h3>
              <p>
                {filter === 'joined' 
                  ? "You haven't joined any challenges yet."
                  : filter === 'available'
                  ? "No challenges available to join right now."
                  : "No challenges match your current filter."
                }
              </p>
            </div>
          ) : (
            filteredChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onJoin={handleJoinChallenge}
                joinLoading={joinLoading === challenge.id}
                currentUser={user}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenges;