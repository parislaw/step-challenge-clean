import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <span className="logo">👟</span>
            30-30 Step Challenge
          </Link>
          
          <div className="navbar-nav">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/challenges" 
              className={`nav-link ${isActive('/challenges') ? 'active' : ''}`}
            >
              Challenges
            </Link>
            <Link 
              to="/submit" 
              className={`nav-link ${isActive('/submit') ? 'active' : ''}`}
            >
              Submit Steps
            </Link>
            <Link 
              to="/leaderboard" 
              className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
            {isAdmin() && (
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="navbar-user">
            <span className="user-greeting">
              Hi, {user ? user.firstName : 'User'}!
            </span>
            <button 
              onClick={logout} 
              className="btn btn-sm btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;