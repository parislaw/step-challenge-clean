import React, { useState, useEffect } from 'react';
import StorageManager from '../components/StorageManager';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="admin-loading">
          <h2>Loading admin dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage challenges, participants, and system resources</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage Management
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-number">{stats?.totalUsers || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Active Challenges</h3>
                  <div className="stat-number">{stats?.activeChallenges || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Submissions</h3>
                  <div className="stat-number">{stats?.totalSubmissions || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Storage Used</h3>
                  <div className="stat-number">{stats?.storageUsed || '0 MB'}</div>
                </div>
              </div>
              
              <div className="recent-activity">
                <h2>Recent Activity</h2>
                <p>Recent submissions, new users, and challenge activity will appear here.</p>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <StorageManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;