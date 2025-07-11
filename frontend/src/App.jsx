import React, { useState, useEffect } from 'react';
import Login from './Login';
import CallDashboard from './CallDashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div>
      <div className="bg-gray-800 text-white flex justify-between items-center px-4 py-2">
        <span>Welcome, {user.name} ({user.role})</span>
        <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
      </div>
      <CallDashboard token={token} user={user} />
    </div>
  );
};

export default App; 