import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ImageUpload from '../components/ImageUpload';
import { challengeAPI, submissionAPI } from '../utils/api';
import { format } from 'date-fns';

const SubmitSteps = () => {
  const [formData, setFormData] = useState({
    stepCount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    challengeId: ''
  });
  const [image, setImage] = useState(null);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [ocrLoading, setOcrLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadActiveChallenges = async () => {
      setLoading(true);
      try {
        const response = await challengeAPI.getAll();
        const userActiveChallenges = response.data.filter(
          challenge => challenge.user_enrolled && challenge.status === 'active'
        );
        setActiveChallenges(userActiveChallenges);
        
        // Auto-select first active challenge
        if (userActiveChallenges.length === 1) {
          setFormData(prev => ({ ...prev, challengeId: userActiveChallenges[0].id }));
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
        setErrors({ general: 'Failed to load your active challenges' });
      } finally {
        setLoading(false);
      }
    };

    loadActiveChallenges();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stepCount) {
      newErrors.stepCount = 'Step count is required';
    } else if (isNaN(formData.stepCount) || parseInt(formData.stepCount) < 0) {
      newErrors.stepCount = 'Please enter a valid step count';
    } else if (parseInt(formData.stepCount) > 100000) {
      newErrors.stepCount = 'Step count seems too high (max: 100,000)';
    }

    if (!formData.challengeId) {
      newErrors.challengeId = 'Please select a challenge';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (imageFile) => {
    setImage(imageFile);
  };

  const handleExtractFromImage = async () => {
    if (!image) {
      alert('Please upload an image first');
      return;
    }

    setOcrLoading(true);
    try {
      const extractData = new FormData();
      extractData.append('stepImage', image);

      const response = await submissionAPI.extractSteps(extractData);
      
      if (response.data.success) {
        setFormData(prev => ({ ...prev, stepCount: response.data.stepCount.toString() }));
        alert(`OCR extracted: ${response.data.stepCount} steps. Please verify this number is correct.`);
      } else {
        alert(response.data.message || 'Could not extract step count from image. Please enter manually.');
      }
    } catch (error) {
      console.error('OCR extraction error:', error);
      alert(error.response?.data?.message || 'OCR extraction failed. Please enter the step count manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setErrors({});

    try {
      const submissionData = new FormData();
      submissionData.append('stepCount', formData.stepCount);
      submissionData.append('date', formData.date);
      submissionData.append('challengeId', formData.challengeId);
      
      if (image) {
        submissionData.append('stepImage', image);
      }

      await submissionAPI.create(submissionData);
      
      alert('Step submission successful! 🎉');
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to submit steps. Please try again.' 
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="submit-loading">
          <h2>Loading your challenges...</h2>
        </div>
      </div>
    );
  }

  if (activeChallenges.length === 0) {
    return (
      <div className="container">
        <div className="no-active-challenges">
          <h2>No Active Challenges</h2>
          <p>You need to join an active challenge before you can submit steps.</p>
          <button 
            className="primary-button"
            onClick={() => navigate('/challenges')}
          >
            Browse Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="submit-steps-page">
        <div className="submit-header">
          <h1>Submit Daily Steps</h1>
          <p>Upload your step counter image and enter your daily step count</p>
        </div>

        <div className="submit-form-container">
          <form onSubmit={handleSubmit} className="submit-form">
            {errors.general && (
              <div className="error-message">{errors.general}</div>
            )}
            
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            {/* Challenge Selection */}
            <div className="form-group">
              <label htmlFor="challengeId">Challenge</label>
              <select
                id="challengeId"
                name="challengeId"
                value={formData.challengeId}
                onChange={handleInputChange}
                className={errors.challengeId ? 'error' : ''}
                disabled={submitLoading}
              >
                <option value="">Select a challenge</option>
                {activeChallenges.map(challenge => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </option>
                ))}
              </select>
              {errors.challengeId && <span className="field-error">{errors.challengeId}</span>}
            </div>

            {/* Date Selection */}
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
                disabled={submitLoading}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Step Counter Image (Optional)</label>
              <ImageUpload onImageChange={handleImageChange} />
              
              {image && (
                <div className="ocr-section">
                  <button
                    type="button"
                    className="ocr-button"
                    onClick={handleExtractFromImage}
                    disabled={ocrLoading || submitLoading}
                  >
                    {ocrLoading ? 'Extracting...' : '🔍 Extract Steps from Image'}
                  </button>
                  <p className="ocr-help">
                    Click to automatically extract step count from your image
                  </p>
                </div>
              )}
            </div>

            {/* Step Count Input */}
            <div className="form-group">
              <label htmlFor="stepCount">Step Count *</label>
              <input
                type="number"
                id="stepCount"
                name="stepCount"
                value={formData.stepCount}
                onChange={handleInputChange}
                className={errors.stepCount ? 'error' : ''}
                placeholder="Enter your step count"
                min="0"
                max="100000"
                disabled={submitLoading}
              />
              {errors.stepCount && <span className="field-error">{errors.stepCount}</span>}
              <p className="input-help">
                Enter your total steps for the selected date
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={submitLoading || ocrLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit Steps'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitSteps;