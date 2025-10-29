import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1>Learning Style Assessment</h1>
        <ul className="navbar-nav">
          {user ? (
            <>
              <li><a href="/">Home</a></li>
              <li><a href="/questionnaire">Assessment</a></li>
              <li><a href="/results">My Results</a></li>
              {user.is_admin && (
                <li><a href="/admin">Admin</a></li>
              )}
              <li>
                <span style={{ marginRight: '10px' }}>Welcome, {user.username}</span>
                <button onClick={onLogout} className="btn btn-secondary" style={{ margin: 0 }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><a href="/">Home</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
