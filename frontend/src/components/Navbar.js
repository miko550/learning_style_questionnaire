import React from 'react';
import { useLanguage } from '../LanguageContext';

const Navbar = ({ user, onLogout }) => {
  const { language, setLanguage } = useLanguage();

  const setLang = (e) => {
    setLanguage(e.target.value);
  };
  return (
    <nav className="navbar">
      <div className="container">
        <h1>Learning Style Assessment</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select value={language} onChange={setLang} className="btn btn-secondary" style={{ padding: '6px 8px' }}>
            <option value="en">English</option>
            <option value="ms">Bahasa Malaysia</option>
          </select>
        </div>
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
