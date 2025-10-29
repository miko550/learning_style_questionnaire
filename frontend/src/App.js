import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      axios.get('/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/questionnaire" 
              element={user ? <Questionnaire /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/results" 
              element={user ? <Results /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user && user.is_admin ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={
                user ? (
                  <div className="card">
                    <h2>Welcome, {user.username}!</h2>
                    <p>Welcome to the Learning Style Assessment platform.</p>
                    <div style={{ marginTop: '20px' }}>
                      <a href="/questionnaire" className="btn">Take Assessment</a>
                      <a href="/results" className="btn btn-secondary">View My Results</a>
                      {user.is_admin && (
                        <a href="/admin" className="btn btn-success">Admin Dashboard</a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <h2>Honey and Mumford Learning Styles Assessment</h2>
                    <p>Discover your learning style by taking our comprehensive 80-question assessment based on the Honey and Mumford model.</p>
                    <div style={{ marginTop: '20px' }}>
                      <a href="/login" className="btn">Login</a>
                      <a href="/register" className="btn btn-secondary">Register</a>
                    </div>
                  </div>
                )
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
