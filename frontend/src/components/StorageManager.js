import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { format } from 'date-fns';

const StorageManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [totalStats, setTotalStats] = useState(null);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const response = await adminAPI.getStorageStats();
      setChallenges(response.data.challenges);
      setTotalStats(response.data.totalStats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImages = async (challengeId, challengeName) => {
    const confirmMessage = `Are you sure you want to delete ALL images from "${challengeName}"?\n\nThis action cannot be undone. Submission records will be kept but image files will be permanently removed.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(challengeId);
    try {
      const response = await adminAPI.deleteImages(challengeId);
      
      alert(`Successfully deleted ${response.data.deletedCount} images and freed ${response.data.spaceFreed} of storage.`);
      
      // Reload storage stats
      await loadStorageStats();
    } catch (error) {
      console.error('Error deleting images:', error);
      alert('Failed to delete images. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="storage-loading">
        <h2>Loading storage statistics...</h2>
      </div>
    );
  }

  return (
    <div className="storage-manager">
      <div className="storage-header">
        <h2>Storage Management</h2>
        <p>Manage image storage for completed challenges to free up disk space</p>
      </div>

      {totalStats && (
        <div className="storage-overview">
          <div className="overview-stats">
            <div className="overview-stat">
              <h3>Total Storage Used</h3>
              <div className="stat-value">{formatBytes(totalStats.totalSize)}</div>
            </div>
            <div className="overview-stat">
              <h3>Total Images</h3>
              <div className="stat-value">{totalStats.totalImages}</div>
            </div>
            <div className="overview-stat">
              <h3>Cleanable Space</h3>
              <div className="stat-value success">{formatBytes(totalStats.cleanableSize)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="challenges-list">
        {challenges.length === 0 ? (
          <div className="no-challenges">
            <h3>No Storage Data</h3>
            <p>No challenges with image submissions found.</p>
          </div>
        ) : (
          challenges.map(challenge => (
            <div key={challenge.id} className="storage-challenge-card">
              <div className="challenge-info">
                <div className="challenge-main">
                  <h3 className="challenge-title">{challenge.title}</h3>
                  <span className={`status-badge ${challenge.status}`}>
                    {challenge.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="challenge-stats">
                  <div className="stat-item">
                    <span className="stat-label">Submissions with images:</span>
                    <span className="stat-value">{challenge.imageSubmissions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Storage used:</span>
                    <span className="stat-value">{formatBytes(challenge.storageSize)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">
                      {challenge.status === 'completed' 
                        ? `${getDaysAgo(challenge.end_date)} days ago`
                        : format(new Date(challenge.end_date), 'MMM d, yyyy')
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="challenge-actions">
                {challenge.status === 'completed' && challenge.imageSubmissions > 0 ? (
                  <button
                    className="delete-images-btn"
                    onClick={() => handleDeleteImages(challenge.id, challenge.title)}
                    disabled={deleteLoading === challenge.id}
                  >
                    {deleteLoading === challenge.id 
                      ? 'Deleting...' 
                      : `Delete ${challenge.imageSubmissions} Images`
                    }
                  </button>
                ) : challenge.imageSubmissions === 0 ? (
                  <span className="no-images">No images to delete</span>
                ) : (
                  <span className="cannot-delete">Challenge still active</span>
                )}
                
                <div className="storage-savings">
                  {challenge.status === 'completed' && challenge.imageSubmissions > 0 && (
                    <span className="savings-estimate">
                      Free up {formatBytes(challenge.storageSize)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="storage-info">
        <h3>How it works</h3>
        <ul>
          <li><strong>Soft Delete:</strong> Image files are deleted but submission records remain</li>
          <li><strong>Completed Only:</strong> Only completed challenges can have images deleted</li>
          <li><strong>Permanent:</strong> This action cannot be undone - images are permanently removed</li>
          <li><strong>Data Preserved:</strong> Step counts, dates, and user progress remain intact</li>
        </ul>
      </div>
    </div>
  );
};

export default StorageManager;